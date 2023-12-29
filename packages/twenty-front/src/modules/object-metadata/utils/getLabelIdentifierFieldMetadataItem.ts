import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getLabelIdentifierFieldMetadataItem = (
  objectMetadataItem: ObjectMetadataItem,
): FieldMetadataItem | undefined => {
  return objectMetadataItem.fields.find(
    (field) =>
      field.id === objectMetadataItem.labelIdentifierFieldMetadataId ||
      field.name === 'name',
  );
};
