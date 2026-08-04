export type PageLayoutTabDragData = {
  type: 'tab';
  tabId: string;
  // The following visible tab (or the first hidden tab, null when none), so a
  // drop past this tab's midpoint resolves to the right beforeTabId.
  nextTabId?: string | null;
};
