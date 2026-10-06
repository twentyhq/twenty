import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { type PageLayout as PageLayoutGenerated } from '~/generated-metadata/graphql';

export type PageLayout = Omit<
  PageLayoutGenerated,
  'tabs' | 'dashboardFilters'
> & {
  tabs: PageLayoutTab[];
  dashboardFilters?: DashboardFilterSlot[] | null;
};
