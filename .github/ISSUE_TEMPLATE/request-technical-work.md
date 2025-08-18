---
name: Request technical chore
about: Request technical work that does not provide any product increment (aka refactoring)
title: ''
labels: ['type: chore']
assignees: ''
---

## Scope & Context

**Example:** 
```
In previous PRs: #1667 and #1636, we have introduced a new MenuItem draggable in the dropdown and implemented a drag and drop behavior.

This is working but it would be great to refactor this into separated components so we can re-use them.
```

## Technical inputs

A clear and detailed description of what the expected change is.
Describe components, files and folders that should be touch and how.
Using a Task list can be helpful

**Example:** 
```
Having a list that is draggable will be useful, not only in dropdown.

Create a folder @/ui/draggable-list with a DraggableList component
This component should take as prop: itemsComponents, onDragEnd((previousIndex, nextIndex) => {})
Use this component in ObjectOptionsDropdownHiddenFieldsContent (move the logic from ObjectOptionsDropdownHiddenFieldsContent to DraggableList) by passing a list of DraggableMenuItems
Add a storybook test on this list (we don't know how to actually test the draggable behavior, but we can at least make sure the component renders correctly a list of items)
```

