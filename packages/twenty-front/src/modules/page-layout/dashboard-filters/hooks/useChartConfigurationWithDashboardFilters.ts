import { useDashboardFilterRecordFilters } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterRecordFilters';
import { appendRecordFiltersToChartFilter } from '@/page-layout/dashboard-filters/utils/appendRecordFiltersToChartFilter';
import { useMemo } from 'react';
import { type ChartFilter } from 'twenty-shared/types';

// For charts whose data is computed server side from the configuration they send.
// Relative date values in these filters are resolved by the chart data services with the timezone stored on the widget at creation,
// while aggregate charts resolve them client side with the viewer's timezone. That asymmetry predates dashboard filters and is left as is.
export const useChartConfigurationWithDashboardFilters = <
  TConfiguration extends { filter?: ChartFilter | null },
>(
  configuration: TConfiguration,
): TConfiguration => {
  const { dashboardFilterRecordFilters } = useDashboardFilterRecordFilters();

  return useMemo(() => {
    if (dashboardFilterRecordFilters.length === 0) {
      return configuration;
    }

    return {
      ...configuration,
      filter: appendRecordFiltersToChartFilter({
        chartFilter: configuration.filter,
        recordFilters: dashboardFilterRecordFilters,
      }),
    };
  }, [configuration, dashboardFilterRecordFilters]);
};
