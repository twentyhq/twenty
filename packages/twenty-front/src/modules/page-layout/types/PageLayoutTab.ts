import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutTab as PageLayoutTabGenerated } from '~/generated/graphql';

export type PageLayoutTab = Omit<PageLayoutTabGenerated, 'widgets'> & {
  widgets: PageLayoutWidget[];
  /**
   * Only available behind IS_RECORD_PAGE_LAYOUT_ENABLED for now.
   */
  layoutMode?: PageLayoutTabLayoutMode;
  icon?: string;
};
