import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isObjectFieldUIReadOnly = (
  fieldMetadataItem: FieldMetadataItem,
  objectMetadataItem: ObjectMetadataItem,
): boolean => {
  const isFieldMarkedAsUIReadOnly = fieldMetadataItem.isUIReadOnly ?? false;
  const isLabelIdentifierField =
    fieldMetadataItem.id === objectMetadataItem.labelIdentifierFieldMetadataId;

  return isFieldMarkedAsUIReadOnly || isLabelIdentifierField;
};
