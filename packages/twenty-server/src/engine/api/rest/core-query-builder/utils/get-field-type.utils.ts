import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const getFieldType = (
  objectMetadata: ObjectMetadataInterface,
  fieldName: string,
): FieldMetadataType | undefined => {
  for (const fieldMetadata of objectMetadata.fields) {
    if (fieldName === fieldMetadata.name) {
      return fieldMetadata.type;
    }
  }
};
