import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type BarChartDataInput } from '~/generated-metadata/graphql';

export const buildDashboardFilterChartDataInput = ({
  boundDashboardFilterValues,
  viewerTimeZone,
}: Pick<WidgetDashboardFilter, 'boundDashboardFilterValues'> & {
  viewerTimeZone: string;
}): Pick<BarChartDataInput, 'dashboardFilterValues' | 'viewerTimeZone'> =>
  isNonEmptyArray(boundDashboardFilterValues)
    ? {
        dashboardFilterValues: boundDashboardFilterValues,
        viewerTimeZone,
      }
    : {};
