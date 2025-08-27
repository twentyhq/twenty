import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

type GetMockFieldMetadataItemOrThrowProps = {
  objectMetadataItem: ObjectMetadataItem;
  fieldName: string;
};

export const getMockFieldMetadataItemOrThrow = ({
  objectMetadataItem,
  fieldName,
}: GetMockFieldMetadataItemOrThrowProps): FieldMetadataItem => {
  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(fieldMetadataItem)) {
    throw new Error(`Field metadata item with name ${fieldName} not found`);
  }

  return fieldMetadataItem;
};
