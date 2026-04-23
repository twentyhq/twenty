import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export type GridLayoutWidgetItem = {
  id: string;
  type: 'widget';
  widget: PageLayoutWidget;
};

export type GridLayoutPlaceholderItem = {
  id: string;
  type: 'placeholder';
};

export type GridLayoutItem = GridLayoutWidgetItem | GridLayoutPlaceholderItem;
