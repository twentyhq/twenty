import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { buildDashboardFilterChartDataInput } from '@/page-layout/utils/buildDashboardFilterChartDataInput';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDashboardFilterChartDataInput = () => {
  const dashboardFilters = useDashboardFilters();

  return useMemo(
    () =>
      isDefined(dashboardFilters)
        ? buildDashboardFilterChartDataInput({
            values: dashboardFilters.values,
            viewerTimeZone: dashboardFilters.timeZone,
          })
        : {},
    [dashboardFilters],
  );
};
