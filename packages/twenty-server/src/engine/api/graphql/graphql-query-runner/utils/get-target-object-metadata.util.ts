import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const getTargetObjectMetadataOrThrow = (
  fieldMetadata: FieldMetadataEntity,
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
