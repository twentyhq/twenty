import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type UnsavedRecordFilters } from '@/views/types/UnsavedRecordFilters';
import { isDefined } from 'twenty-shared/utils';

export const getRestorableUnsavedRecordFilters = ({
  unsavedRecordFilters,
  fieldMetadataItems,
}: {
  unsavedRecordFilters: UnsavedRecordFilters | null;
  fieldMetadataItems: FieldMetadataItem[];
}): UnsavedRecordFilters | null => {
  if (
    !isDefined(unsavedRecordFilters) ||
    !Array.isArray(unsavedRecordFilters.recordFilters) ||
    !Array.isArray(unsavedRecordFilters.recordFilterGroups)
  ) {
    return null;
  }

  const fieldMetadataIds = new Set(
    fieldMetadataItems.map((fieldMetadataItem) => fieldMetadataItem.id),
  );

  const areAllFieldsResolvable = unsavedRecordFilters.recordFilters.every(
    (recordFilter) =>
      fieldMetadataIds.has(recordFilter.fieldMetadataId) &&
      (!isDefined(recordFilter.relationTargetFieldMetadataId) ||
        fieldMetadataIds.has(recordFilter.relationTargetFieldMetadataId)),
  );

  return areAllFieldsResolvable ? unsavedRecordFilters : null;
};
