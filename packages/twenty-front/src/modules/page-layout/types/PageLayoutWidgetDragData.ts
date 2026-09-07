import { type WidgetType } from '~/generated-metadata/graphql';

export type PageLayoutWidgetDragData = {
  type: 'widget';
  widgetId: string;
  widgetType: WidgetType;
  tabId: string;
  index: number;
};
