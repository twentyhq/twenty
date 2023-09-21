---
name: Add new feature / behavior
about: Describe the desired product increment
title: 'Ex: Add custom field from Companies / People table options menu'
labels: ''
assignees: ''

---

## Scope & Context

**Example:** 
```
We are working on enabling users to add custom fields in their workspace. 
The ticket is about adding the custom field feature on Companies and People pages only.
```

## Current behavior

A clear and concise description of what the current behavior is.
Please also add **screenshots** of the existing application.

**Example:** 
```
On Companies and People pages, the "field" menu item from the option menu shows both displayed columns, and hidden columns
[screenshot]
```

## Expected behavior
A clear and concise description of what you want to happen.
Please also add **figma screenshots or figma links** if available

**Example:** 
```
The "field" menu item from the option menu should only display visible columns. To display a new column, the user should click on "Add field" at the bottom of the menu.
[figma screenshot 1]
[figma link 1]

Clicking on this button should swap the menu with the same menu that is used by pressing the "+" button on the table title bar, showing "Add custom field option"
[figma screenshot 2]
[figma link 2]

Clicking on "Add custom field" should open swap the menu with the "field type" menu
...
```


## Technical inputs

**Example:** 
```
- Modify TableOptionsDropdownContent to add the new "Add field Item" using a MenuItem component
- Create an internal state 'isAddingField' to track the progress in the flow. Set this state to true on "Add field Item" onClick
- ...
```
