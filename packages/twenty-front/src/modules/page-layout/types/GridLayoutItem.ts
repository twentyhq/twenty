import { type PageLayoutWidget } from '~/generated/graphql';

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
