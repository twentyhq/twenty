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

export type PageLayoutWidgetDndData =
  | PageLayoutWidgetDragData
  | PageLayoutTabWidgetDropData;
