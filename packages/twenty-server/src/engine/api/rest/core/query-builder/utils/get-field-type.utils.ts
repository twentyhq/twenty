import { FieldMetadataType } from 'twenty-shared';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const getFieldType = (
  objectMetadata: ObjectMetadataItemWithFieldMaps,
  fieldName: string,
): FieldMetadataType | undefined => {
  return objectMetadata.fieldsByName[fieldName]?.type;
};
