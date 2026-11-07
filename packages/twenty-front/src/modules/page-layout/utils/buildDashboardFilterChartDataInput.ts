import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type BarChartDataInput } from '~/generated-metadata/graphql';

export const buildDashboardFilterChartDataInput = ({
  boundDashboardFilterValues,
  timeZone,
}: Pick<WidgetDashboardFilter, 'boundDashboardFilterValues'> & {
  timeZone: string;
}): Pick<
  BarChartDataInput,
  'dashboardFilterValues' | 'dashboardFilterTimeZone'
> =>
  isNonEmptyArray(boundDashboardFilterValues)
    ? {
        dashboardFilterValues: boundDashboardFilterValues,
        dashboardFilterTimeZone: timeZone,
      }
    : {};
