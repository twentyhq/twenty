import {
  type PageLayout as PageLayoutGenerated,
  type PageLayoutTab as PageLayoutTabGenerated,
  type PageLayoutWidget,
} from '~/generated/graphql';

export type PageLayoutTab = Omit<PageLayoutTabGenerated, 'widgets'> & {
  widgets: PageLayoutWidget[];
};

export type PageLayout = Omit<PageLayoutGenerated, 'tabs'> & {
  tabs: PageLayoutTab[];
};
