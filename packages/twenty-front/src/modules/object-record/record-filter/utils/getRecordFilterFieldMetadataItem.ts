import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFilterFieldMetadataItem = ({
  recordFilter,
  objectMetadataItems,
}: {
  recordFilter: RecordFilter;
  objectMetadataItems: ObjectMetadataItem[];
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
