import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { ObjectMetadataMap } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';

export const getRelationObjectMetadata = (
  fieldMetadata: FieldMetadataInterface,
  objectMetadataMap: ObjectMetadataMap,
) => {
  const relationMetadata =
    fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

  if (!relationMetadata) {
    throw new Error(
      `Relation metadata not found for field ${fieldMetadata.name}`,
    );
  }

  const relationDirection = deduceRelationDirection(
    fieldMetadata,
    relationMetadata,
  );

  const referencedObjectMetadata =
    relationDirection === RelationDirection.TO
      ? objectMetadataMap[relationMetadata.fromObjectMetadataId]
      : objectMetadataMap[relationMetadata.toObjectMetadataId];

  if (!referencedObjectMetadata) {
    throw new Error(
      `Referenced object metadata not found for relation ${relationMetadata.id}`,
    );
  }

  return referencedObjectMetadata;
};
