import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getFieldPreviewValueFromRecord = ({
  record,
  fieldMetadataItem,
}: {
  record: ObjectRecord;
  fieldMetadataItem: Pick<FieldMetadataItem, 'name' | 'type'>;
}) => {
  const recordFieldValue = record[fieldMetadataItem.name];

  // Relation fields (to many)
  if (
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    Array.isArray(recordFieldValue?.edges)
  ) {
    return recordFieldValue.edges[0]?.node;
  }

  // Other fields
  return recordFieldValue;
};
