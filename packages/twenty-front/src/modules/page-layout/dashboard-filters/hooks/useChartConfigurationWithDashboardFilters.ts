import { useDashboardFilterRecordFilters } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterRecordFilters';
import { appendRecordFiltersToChartFilter } from '@/page-layout/dashboard-filters/utils/appendRecordFiltersToChartFilter';
import { useMemo } from 'react';
import { type ChartFilter } from 'twenty-shared/types';

// For charts whose data is computed server side from the configuration they send.
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
