// BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentages = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentages = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;

    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1 // usually what we use to say that it does not exist
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      //ID = 0;
      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //why id? can you use .value instead?
      } else {
        ID = 0;
      }

      // New item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      //loop over all elements
      ids = data.allItems[type].map(function(current) {
        //map loops over the array and returns a brand new array
        return current.id;
      });

      index = ids.indexOf(id); // indexOf method returns the index number of the element of the array (id) that we pass into the function (id)

      console.log("This is the data before the deletion " + data);
      console.log("This is the array that got created " + ids);
      console.log("This is the index that shows the position " + index);

      if (index !== -1) {
        data.allItems[type].splice(index, 1); // first argument is the position number on which we want to start deleting, the second is the number of the elements we want to delete
      }

      console.log("This is the new data array after deletion " + data);
    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentages(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentages();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

// UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  formatNumber = function(num, type) {
    var numSplit, int, dec, type;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      //substring (substr) allows us to only take part of a string...method is gonna return part of the string that we want
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length); //input 23510, output 25,310
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml;

      // Create HTML string with place holder text

      if (type === "inc") {
        element = DOMstrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    removeListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );
      //console.log(fields,typeof(fields));

      fieldsArr = Array.prototype.slice.call(fields);
      //console.log(fieldsArr,typeof(fieldsArr));

      // forEach function can receive up to three arguments
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).innerHTML = formatNumber(
        obj.budget,
        type
      );

      document.querySelector(DOMstrings.incomeLabel).innerHTML = formatNumber(
        obj.totalInc,
        "inc"
      );

      document.querySelector(DOMstrings.expensesLabel).innerHTML = formatNumber(
        obj.totalExp,
        "exp"
      );

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).innerHTML =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).innerHTML = "---";
      }
    },

    displayPercentages: function(percentage) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentage[index] > 0) {
          current.textContent = percentage[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      var now, year;

      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      month = now.getMonth();
      year = now.getFullYear(); //this will return whatever date this year is

      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

// Separating of concerns basically means that each part of the application
// should only be interested in doing one thing independently

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrlr, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      // console.log(event);
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    // inputting the bubbling event handler
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    //
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var ctrlDeleteItem = function(event) {
    var itemID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      //inc-1 Identify the ID that you want to delete
      splitID = itemID.split("-"); //example this method returns {"inc","1"} for inc-1
      type = splitID[0];
      ID = parseInt(splitID[1]); // parseInt converts string integers to number integers
      //console.log(ID);

      // 1. Delete the item from the data structure
      budgetCtrlr.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.removeListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();
    }
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrlr.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI

      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields

      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update the percentages
      updatePercentages();
    }
  };

  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrlr.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrlr.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // 1. Calculate percentages
    budgetCtrlr.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrlr.getPercentages();

    // 3. Update the UI with the new percentages
    console.log(percentages);
    UICtrl.displayPercentages(percentages);
  };

  return {
    init: function() {
      console.log("Application has started.");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });

      UICtrl.displayMonth();

      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
