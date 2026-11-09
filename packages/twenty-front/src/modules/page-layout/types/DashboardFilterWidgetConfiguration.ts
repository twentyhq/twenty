import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type ChartFilter } from 'twenty-shared/types';

export type DashboardFilterWidgetConfiguration = Pick<
  PageLayoutWidget['configuration'],
  '__typename'
> & {
  dashboardFilterBindings?:
    | { pageLayoutFilterId: string; fieldMetadataId?: string | null }[]
    | null;
  primaryAxisGroupByFieldMetadataId?: string | null;
  groupByFieldMetadataId?: string | null;
  filter?: ChartFilter | null;
};
