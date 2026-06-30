import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFilterFieldMetadataItem = ({
  recordFilter,
  objectMetadataItems,
}: {
  recordFilter: RecordFilter;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => {
  const allFieldMetadataItems = objectMetadataItems.flatMap(
    (objectMetadataItem) => objectMetadataItem.fields,
  );

  const foundFieldMetadataItem = allFieldMetadataItems.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === recordFilter.fieldMetadataId,
  );

  if (!isDefined(foundFieldMetadataItem)) {
    throw new Error(
      `Field metadata item not found for field metadata id: ${recordFilter.fieldMetadataId}`,
    );
  }

  return foundFieldMetadataItem;
};
