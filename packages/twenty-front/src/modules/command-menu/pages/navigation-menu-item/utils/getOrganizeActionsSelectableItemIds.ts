export const getOrganizeActionsSelectableItemIds = (
  includeMoveToFolder: boolean,
) => [
  'move-up',
  'move-down',
  ...(includeMoveToFolder ? ['move-to-folder'] : []),
  'add-before',
  'add-after',
  'remove',
];
