import {
  type PageLayoutTab as PageLayoutTabGenerated,
  type PageLayoutWidget,
} from '~/generated/graphql';

export type PageLayoutTab = Omit<PageLayoutTabGenerated, 'widgets'> & {
  widgets: PageLayoutWidget[];
};
