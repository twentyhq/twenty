import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

export const objectContainsRelationField = (
  objectMetadata: ObjectMetadataInterface,
): boolean => {
  return objectMetadata.fields.some((field) =>
    isRelationFieldMetadataType(field.type),
  );
};
