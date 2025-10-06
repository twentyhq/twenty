import { FieldMetadataType } from 'twenty-shared/types';

import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

import { shouldGroupByDateBucket as shouldGroupByDateBucketUtil } from './should-group-by-date-bucker';

export const parseGroupByArgs = (
  args: GroupByResolverArgs,
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
): GroupByField[] => {
  const groupByFieldNames = args.groupBy;

  const groupByFields: GroupByField[] = [];

  for (const fieldNames of groupByFieldNames) {
    if (Object.keys(fieldNames).length > 1) {
      throw new GraphqlQueryRunnerException(
        'You cannot provide multiple fields in one GroupByInput, split them into multiple GroupByInput',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
    for (const fieldName of Object.keys(fieldNames)) {
      const fieldMetadataId =
        objectMetadataItemWithFieldMaps.fieldIdByName[fieldName];
      const fieldMetadata =
        objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

      if (
        fieldMetadata.type === FieldMetadataType.DATE ||
        fieldMetadata.type === FieldMetadataType.DATE_TIME
      ) {
        const fieldGroupByDefinition = fieldNames[fieldName];

        const shouldGroupByDateBucket = shouldGroupByDateBucketUtil(
          fieldGroupByDefinition,
        );

        if (shouldGroupByDateBucket) {
          groupByFields.push({
            fieldMetadata,
            dateBucket: fieldGroupByDefinition.bucket,
          });
          continue;
        }
      }

      if (fieldNames[fieldName] === true) {
        groupByFields.push({
          fieldMetadata,
          subFieldName: undefined,
        });
        continue;
      } else if (typeof fieldNames[fieldName] === 'object') {
        if (Object.keys(fieldNames[fieldName]).length > 1) {
          throw new GraphqlQueryRunnerException(
            'You cannot provide multiple subfields in one GroupByInput, split them into multiple GroupByInput',
            GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          );
        }
        for (const subFieldName of Object.keys(fieldNames[fieldName])) {
          if (
            (fieldNames[fieldName] as Record<string, boolean>)[subFieldName] ===
            true
          ) {
            groupByFields.push({
              fieldMetadata,
              subFieldName,
            });
            continue;
          }
        }
      }
    }
  }

  return groupByFields;
};
