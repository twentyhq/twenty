export type PageLayoutTabDragData = {
  type: 'tab';
  tabId: string;
  // The next visible tab, else the first hidden one, so a drop past the midpoint resolves beforeTabId.
  nextTabId: string | null;
};
