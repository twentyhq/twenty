import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const getFieldType = (
  objectMetadata: ObjectMetadataInterface,
  fieldName: string,
): FieldMetadataType | undefined => {
  return objectMetadata.fields.find((field) => field.name === fieldName)?.type;
};
