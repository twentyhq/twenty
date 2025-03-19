import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { FieldMetadataType } from 'twenty-shared/types';

export const getFieldType = (
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  fieldName: string,
): FieldMetadataType | undefined => {
  return objectMetadataItem.fieldsByName[fieldName]?.type;
};
