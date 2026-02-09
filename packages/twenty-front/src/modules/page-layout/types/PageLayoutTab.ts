import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutTab as PageLayoutTabGenerated } from '~/generated/graphql';

export type PageLayoutTab = Omit<
  PageLayoutTabGenerated,
  'widgets' | 'layoutMode'
> & {
  widgets: PageLayoutWidget[];
  layoutMode?: PageLayoutTabLayoutMode;
  icon?: string | null;
};
