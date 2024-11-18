import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';

export const getRelationObjectMetadata = (
  fieldMetadata: FieldMetadataInterface,
  objectMetadataMaps: ObjectMetadataMaps,
) => {
  const relationMetadata = getRelationMetadata(fieldMetadata);

  const relationDirection = deduceRelationDirection(
    fieldMetadata,
    relationMetadata,
  );

  const referencedObjectMetadata =
    relationDirection === RelationDirection.TO
      ? objectMetadataMaps.byId[relationMetadata.fromObjectMetadataId]
      : objectMetadataMaps.byId[relationMetadata.toObjectMetadataId];

  if (!referencedObjectMetadata) {
    throw new Error(
      `Referenced object metadata not found for relation ${relationMetadata.id}`,
    );
  }

  return referencedObjectMetadata;
};

export const getRelationMetadata = (
  fieldMetadata: FieldMetadataInterface,
): RelationMetadataEntity => {
  const relationMetadata =
    fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

  if (!relationMetadata) {
    throw new Error(
      `Relation metadata not found for field ${fieldMetadata.name}`,
    );
  }

  return relationMetadata;
};
