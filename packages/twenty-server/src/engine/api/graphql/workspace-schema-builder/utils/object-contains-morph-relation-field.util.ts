import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isMorphRelationFieldMetadataType } from 'src/engine/utils/is-morph-relation-field-metadata-type.util';

export const objectContainsMorphRelationField = (
  objectMetadata: ObjectMetadataEntity,
): boolean => {
  return objectMetadata.fields.some((field) =>
    isMorphRelationFieldMetadataType(field.type),
  );
};
