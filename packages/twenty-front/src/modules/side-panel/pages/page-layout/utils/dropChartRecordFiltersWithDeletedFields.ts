import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { isDefined } from 'twenty-shared/utils';

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

  let remainingGroups = [...recordFilterGroups];
  let changed = true;

  while (changed) {
    changed = false;
    const remainingGroupIds = new Set(remainingGroups.map((g) => g.id));

    const nonEmptyGroupIds = new Set(
      [
        ...validRecordFilters
          .map((f) => f.recordFilterGroupId)
          .filter(isDefined),
        ...remainingGroups
          .map((g) => g.parentRecordFilterGroupId)
          .filter(isDefined),
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
      if (!isDefined(groupId)) return true;
      return remainingGroups.some((g) => g.id === groupId);
    },
  );

  return {
    ...chartFilters,
    recordFilters: validRecordFiltersWithDroppedOrphanedGroups,
    recordFilterGroups: remainingGroups,
  };
};
