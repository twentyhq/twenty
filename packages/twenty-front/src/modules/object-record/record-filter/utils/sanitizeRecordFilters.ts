import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { removeEmptyRecordFilterGroups } from '@/object-record/record-filter-group/utils/removeEmptyRecordFilterGroups';
import { type RecordFiltersWithGroups } from '@/object-record/record-filter/types/RecordFiltersWithGroups';
import { pointRecordFiltersAtMorphRelationFields } from '@/object-record/record-filter/utils/pointRecordFiltersAtMorphRelationFields';
import { isDefined } from 'twenty-shared/utils';

export const sanitizeRecordFilters = ({
  recordFiltersWithGroups,
  fieldMetadataItems,
}: {
  recordFiltersWithGroups: RecordFiltersWithGroups;
  fieldMetadataItems: (Pick<FieldMetadataItem, 'id' | 'isActive'> & {
    morphRelations?: { sourceFieldMetadata: { id: string } }[] | null;
  })[];
}): RecordFiltersWithGroups => {
  const activeFieldMetadataItems = fieldMetadataItems.filter(
    (fieldMetadataItem) => fieldMetadataItem.isActive,
  );

  const validFieldMetadataIds = new Set(
    activeFieldMetadataItems.map(({ id }) => id),
  );

  const validRecordFilters = pointRecordFiltersAtMorphRelationFields({
    recordFilters: recordFiltersWithGroups.recordFilters ?? [],
    fieldMetadataItems: activeFieldMetadataItems,
  }).filter((recordFilter) =>
    validFieldMetadataIds.has(recordFilter.fieldMetadataId),
  );

  const remainingGroups = removeEmptyRecordFilterGroups({
    recordFilters: validRecordFilters,
    recordFilterGroups: recordFiltersWithGroups.recordFilterGroups ?? [],
  });

  const validRecordFiltersWithDroppedOrphanedGroups = validRecordFilters.filter(
    (f) => {
      const groupId = f.recordFilterGroupId;
      if (!isDefined(groupId)) return true;
      return remainingGroups.some((g) => g.id === groupId);
    },
  );

  return {
    ...recordFiltersWithGroups,
    recordFilters: validRecordFiltersWithDroppedOrphanedGroups,
    recordFilterGroups: remainingGroups,
  };
};
