export const getSuggestionMenuItemAnchorId = (itemKey: string) =>
  `suggestion-menu-item-${itemKey.replace(/[^a-zA-Z0-9-_]/g, '_')}`;
