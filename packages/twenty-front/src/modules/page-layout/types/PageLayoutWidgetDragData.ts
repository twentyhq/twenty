import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type WidgetType } from '~/generated-metadata/graphql';

export type PageLayoutWidgetDragData = {
  type: 'widget';
  widgetId: string;
  widgetType: WidgetType;
  widgetPosition: PageLayoutWidget['position'];
  tabId: string;
  index: number;
};
