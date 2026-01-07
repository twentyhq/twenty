import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getTargetObjectMetadataOrThrow = (
  fieldMetadata: FlatFieldMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): FlatObjectMetadata => {
  if (!fieldMetadata.relationTargetObjectMetadataId) {
    throw new GraphqlQueryRunnerException(
      `Relation target object metadata id not found for field ${fieldMetadata.name}`,
      GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const targetObjectMetadata =
    flatObjectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

  if (!targetObjectMetadata) {
    throw new GraphqlQueryRunnerException(
      `Target object metadata not found for field ${fieldMetadata.name}`,
      GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  return targetObjectMetadata;
};
