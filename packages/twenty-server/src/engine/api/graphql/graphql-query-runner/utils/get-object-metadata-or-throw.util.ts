import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectMetadataMapItem } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

export const getObjectMetadataOrThrow = (
  objectMetadataMap: Record<string, any>,
  objectName: string,
): ObjectMetadataMapItem => {
  const objectMetadata = objectMetadataMap[objectName];

  if (!objectMetadata) {
    throw new GraphqlQueryRunnerException(
      `Object metadata not found for ${objectName}`,
      GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  return objectMetadata;
};
