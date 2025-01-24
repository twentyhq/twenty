import { FieldMetadataType } from 'twenty-shared';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export const getFieldType = (
  objectMetadata: ObjectMetadataInterface,
  fieldName: string,
): FieldMetadataType | undefined => {
  return objectMetadata.fields.find((field) => field.name === fieldName)?.type;
};
