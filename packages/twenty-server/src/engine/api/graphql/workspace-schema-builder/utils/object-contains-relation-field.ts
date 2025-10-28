import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';

export const objectContainsRelationField = (
  objectMetadata: ObjectMetadataEntity,
): boolean => {
  return objectMetadata.fields.some((field) =>
    isMorphOrRelationFieldMetadataType(field.type),
  );
};
