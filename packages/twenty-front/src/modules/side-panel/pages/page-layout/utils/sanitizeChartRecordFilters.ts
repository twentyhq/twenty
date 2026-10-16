import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { pointChartRecordFiltersAtMorphRelationFields } from '@/side-panel/pages/page-layout/utils/pointChartRecordFiltersAtMorphRelationFields';
import { isDefined } from 'twenty-shared/utils';

export const sanitizeChartRecordFilters = ({
  chartFilters,
  fieldMetadataItems,
}: {
  chartFilters: ChartFilters;
  fieldMetadataItems: (Pick<FieldMetadataItem, 'id' | 'isActive'> & {
    morphRelations?: { sourceFieldMetadata: { id: string } }[] | null;
  })[];
}): ChartFilters => {
  const activeFieldMetadataItems = fieldMetadataItems.filter(
    (fieldMetadataItem) => fieldMetadataItem.isActive,
  );

  const validFieldMetadataIds = new Set(
    activeFieldMetadataItems.map(({ id }) => id),
  );

  const validRecordFilters = pointChartRecordFiltersAtMorphRelationFields({
    recordFilters: chartFilters.recordFilters ?? [],
    fieldMetadataItems: activeFieldMetadataItems,
  }).filter((recordFilter) =>
    validFieldMetadataIds.has(recordFilter.fieldMetadataId),
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
