import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';

export const dropChartRecordFiltersWithDeletedFields = ({
  chartFilters,
  validFieldMetadataIds,
}: {
  chartFilters: ChartFilters;
  validFieldMetadataIds: Set<string>;
}): ChartFilters => ({
  ...chartFilters,
  recordFilters: (chartFilters.recordFilters ?? []).filter((recordFilter) =>
    validFieldMetadataIds.has(recordFilter.fieldMetadataId),
  ),
});
