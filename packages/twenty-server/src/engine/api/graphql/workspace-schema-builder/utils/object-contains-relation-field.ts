import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

export const objectContainsRelationField = (
  objectMetadata: ObjectMetadataEntity,
): boolean => {
  return objectMetadata.fields.some((field) =>
    isRelationFieldMetadataType(field.type),
  );
};
