export const getSidePanelSearchResultAnchorId = (itemId: string) =>
  `side-panel-search-result-${itemId.replace(/[^a-zA-Z0-9-_]/g, '_')}`;
