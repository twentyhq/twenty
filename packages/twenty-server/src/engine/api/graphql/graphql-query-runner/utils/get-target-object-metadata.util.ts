import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const getTargetObjectMetadataOrThrow = (
  fieldMetadata: FieldMetadataInterface,
  objectMetadataMaps: ObjectMetadataMaps,
) => {
  if (!fieldMetadata.relationTargetObjectMetadataId) {
    throw new GraphqlQueryRunnerException(
      `Relation target object metadata id not found for field ${fieldMetadata.name}`,
      GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
    );
  }

  const targetObjectMetadata =
    objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

  if (!targetObjectMetadata) {
    throw new GraphqlQueryRunnerException(
      `Target object metadata not found for field ${fieldMetadata.name}`,
      GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
    );
  }

  return targetObjectMetadata;
};
