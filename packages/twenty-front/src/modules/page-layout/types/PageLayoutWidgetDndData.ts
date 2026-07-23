export type PageLayoutWidgetDragData = {
  type: 'widget';
  widgetId: string;
  tabId: string;
  index: number;
};

export type PageLayoutTabWidgetDropData = {
  type: 'tab-widget-drop';
  tabId: string;
};

export type PageLayoutWidgetListDropData = {
  type: 'widget-list';
  tabId: string;
};

export type PageLayoutTabDragData = {
  type: 'tab';
  tabId: string;
};

// beforeTabId null means append after the last tab.
export type PageLayoutTabListEndDropData = {
  type: 'tab-list-end';
  beforeTabId: string | null;
};

export type PageLayoutTabMoreButtonDropData = {
  type: 'tab-more-button';
};

export type PageLayoutWidgetDndData =
  | PageLayoutWidgetDragData
  | PageLayoutTabWidgetDropData
  | PageLayoutWidgetListDropData
  | PageLayoutTabDragData
  | PageLayoutTabListEndDropData
  | PageLayoutTabMoreButtonDropData;
