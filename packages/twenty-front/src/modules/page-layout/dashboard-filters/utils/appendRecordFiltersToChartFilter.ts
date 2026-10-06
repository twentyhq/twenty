import { type ChartFilter } from 'twenty-shared/types';
import { type RecordFilter } from 'twenty-shared/utils';

// Dashboard filters are appended next to the chart's own root-level filters so they are ANDed with everything.
export const appendRecordFiltersToChartFilter = ({
  chartFilter,
  recordFilters,
}: {
  chartFilter: ChartFilter | null | undefined;
  recordFilters: RecordFilter[];
}): ChartFilter | null | undefined => {
  if (recordFilters.length === 0) {
    return chartFilter;
  }

  return {
    ...chartFilter,
    recordFilters: [...(chartFilter?.recordFilters ?? []), ...recordFilters],
  };
};
