import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const getTargetObjectMetadata = (
  fieldMetadata: FieldMetadataInterface,
  objectMetadataMaps: ObjectMetadataMaps,
) => {
  if (!fieldMetadata.relationTargetObjectMetadataId) {
    throw new Error(
      `Relation target object metadata id not found for field ${fieldMetadata.name}`,
    );
  }

  const targetObjectMetadata =
    objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

  if (!targetObjectMetadata) {
    throw new Error(
      `Target object metadata not found for field ${fieldMetadata.name}`,
    );
  }

  return targetObjectMetadata;
};
