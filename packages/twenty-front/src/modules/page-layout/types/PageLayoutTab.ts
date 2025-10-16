import {
  type PageLayoutTab as PageLayoutTabGenerated,
  type PageLayoutWidget,
} from '~/generated/graphql';

export type PageLayoutTab = Omit<PageLayoutTabGenerated, 'widgets'> & {
  widgets: PageLayoutWidget[];
  /**
   * Only available behind IS_RECORD_PAGE_LAYOUT_ENABLED for now.
   */
  layoutMode?: 'grid' | 'vertical-list';
};
