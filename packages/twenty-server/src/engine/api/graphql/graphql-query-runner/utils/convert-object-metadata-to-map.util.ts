import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

export type FieldMetadataMap = Record<string, FieldMetadataInterface>;

export type ObjectMetadataMapItem = Omit<ObjectMetadataInterface, 'fields'> & {
  fields: FieldMetadataMap;
};

export type ObjectMetadataMap = Record<string, ObjectMetadataMapItem>;

export const convertObjectMetadataToMap = (
  objectMetadataCollection: ObjectMetadataInterface[],
): ObjectMetadataMap => {
  const objectMetadataMap: ObjectMetadataMap = {};

  for (const objectMetadata of objectMetadataCollection) {
    const fieldsMap: FieldMetadataMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      fieldsMap[fieldMetadata.name] = fieldMetadata;
    }

    const processedObjectMetadata: ObjectMetadataMapItem = {
      ...objectMetadata,
      fields: fieldsMap,
    };

    objectMetadataMap[objectMetadata.id] = processedObjectMetadata;
    objectMetadataMap[objectMetadata.nameSingular] = processedObjectMetadata;
    objectMetadataMap[objectMetadata.namePlural] = processedObjectMetadata;
  }

  return objectMetadataMap;
};

export const getObjectMetadata = (
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
