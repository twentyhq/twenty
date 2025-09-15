import {
  type PageLayout,
  type PageLayoutTab,
  type PageLayoutWidget,
} from '~/generated/graphql';

// TODO: Remove this once we query the data from the database
export type PageLayoutWidgetWithData = PageLayoutWidget & {
  data?: Record<string, any>;
};

export type PageLayoutTabWithData = Omit<PageLayoutTab, 'widgets'> & {
  widgets: PageLayoutWidgetWithData[];
};

export type PageLayoutWithData = Omit<PageLayout, 'tabs'> & {
  tabs: PageLayoutTabWithData[];
};
