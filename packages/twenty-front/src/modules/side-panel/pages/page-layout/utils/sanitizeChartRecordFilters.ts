import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { removeEmptyRecordFilterGroups } from '@/object-record/record-filter-group/utils/removeEmptyRecordFilterGroups';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { pointRecordFiltersAtMorphRelationFields } from '@/object-record/record-filter/utils/pointRecordFiltersAtMorphRelationFields';
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

  const validRecordFilters = pointRecordFiltersAtMorphRelationFields({
    recordFilters: chartFilters.recordFilters ?? [],
    fieldMetadataItems: activeFieldMetadataItems,
  }).filter((recordFilter) =>
    validFieldMetadataIds.has(recordFilter.fieldMetadataId),
  );

  const remainingGroups = removeEmptyRecordFilterGroups({
    recordFilters: validRecordFilters,
    recordFilterGroups: chartFilters.recordFilterGroups ?? [],
  });

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
