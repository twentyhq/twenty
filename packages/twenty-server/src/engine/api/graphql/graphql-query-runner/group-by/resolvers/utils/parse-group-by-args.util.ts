import { isDefined } from 'class-validator';
import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

const isGroupByDateFieldDefinition = (
  fieldGroupByDefinition:
    | boolean
    | Record<string, boolean>
    | { granularity: ObjectRecordGroupByDateGranularity }
    | undefined,
): fieldGroupByDefinition is {
  granularity: ObjectRecordGroupByDateGranularity;
} => {
  if (
    typeof fieldGroupByDefinition !== 'object' ||
    !isDefined(fieldGroupByDefinition)
  ) {
    return false;
  }
  if (!('granularity' in fieldGroupByDefinition)) {
    return false;
  }

  const granularity = fieldGroupByDefinition.granularity;

  return (
    isDefined(granularity) &&
    typeof granularity === 'string' &&
    Object.values(ObjectRecordGroupByDateGranularity).includes(
      granularity as ObjectRecordGroupByDateGranularity,
    )
  );
};

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
        objectMetadataItemWithFieldMaps.fieldIdByName[fieldName] ||
        objectMetadataItemWithFieldMaps.fieldIdByJoinColumnName[fieldName];
      const fieldMetadata =
        objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

      if (!isDefined(fieldMetadata) || !isDefined(fieldMetadataId)) {
        throw new Error(`Unidentified field in groupBy: ${fieldName}`);
      }

      if (
        fieldMetadata.type === FieldMetadataType.DATE ||
        fieldMetadata.type === FieldMetadataType.DATE_TIME
      ) {
        const fieldGroupByDefinition = fieldNames[fieldName];

        const shouldGroupByDateGranularity = isGroupByDateFieldDefinition(
          fieldGroupByDefinition,
        );

        if (shouldGroupByDateGranularity) {
          groupByFields.push({
            fieldMetadata,
            dateGranularity: fieldGroupByDefinition.granularity,
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
