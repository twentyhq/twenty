export const getSuggestionMenuItemAnchorId = ({
  menuId,
  itemKey,
}: {
  menuId: string;
  itemKey: string;
}) => `${menuId}-${encodeURIComponent(itemKey)}`;
