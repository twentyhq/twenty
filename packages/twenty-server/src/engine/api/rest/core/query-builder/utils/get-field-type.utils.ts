import { FieldMetadataType } from 'twenty-shared/types';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const getFieldType = (
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  fieldName: string,
): FieldMetadataType | undefined => {
  const fieldMetadataId = objectMetadataItem.fieldIdByName[fieldName];
  const field = objectMetadataItem.fieldsById[fieldMetadataId];

  return field?.type;
};
