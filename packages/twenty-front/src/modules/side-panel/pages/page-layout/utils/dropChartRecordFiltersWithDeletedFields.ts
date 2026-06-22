import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';

export const dropChartRecordFiltersWithDeletedFields = ({
  chartFilters,
  validFieldMetadataIds,
}: {
  chartFilters: ChartFilters;
  validFieldMetadataIds: Set<string>;
}): ChartFilters => {
  const validRecordFilters = (chartFilters.recordFilters ?? []).filter(
    (recordFilter) => validFieldMetadataIds.has(recordFilter.fieldMetadataId),
  );

  const recordFilterGroups = chartFilters.recordFilterGroups ?? [];

  // Iteratively remove groups that have no valid filters and no child groups remaining.
  let remainingGroups = [...recordFilterGroups];
  let changed = true;

  while (changed) {
    changed = false;
    const remainingGroupIds = new Set(remainingGroups.map((g) => g.id));

    const nonEmptyGroupIds = new Set(
      [
        ...validRecordFilters
          .map((f) => f.recordFilterGroupId)
          .filter((id): id is string => id !== undefined),
        ...remainingGroups
          .map((g) => g.parentRecordFilterGroupId)
          .filter((id): id is string => id !== undefined),
      ].filter((id) => remainingGroupIds.has(id)),
    );

    const nextGroups = remainingGroups.filter((g) =>
      nonEmptyGroupIds.has(g.id),
    );

    if (nextGroups.length !== remainingGroups.length) {
      remainingGroups = nextGroups;
      changed = true;
    }
  }

  const validRecordFiltersWithDroppedOrphanedGroups = validRecordFilters.filter(
    (f) => {
      const groupId = f.recordFilterGroupId;
      if (groupId === undefined) return true;
      return remainingGroups.some((g) => g.id === groupId);
    },
  );

  return {
    ...chartFilters,
    recordFilters: validRecordFiltersWithDroppedOrphanedGroups,
    recordFilterGroups: remainingGroups,
  };
};
