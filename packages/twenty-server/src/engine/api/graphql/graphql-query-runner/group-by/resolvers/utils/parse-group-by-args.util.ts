import { UserInputError } from 'apollo-server-core';
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
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

type CompositeFieldGroupByDefinition = Record<string, boolean>;

type DateFieldGroupByDefinition = {
  granularity: ObjectRecordGroupByDateGranularity;
};

type FieldGroupByDefinition =
  | boolean
  | CompositeFieldGroupByDefinition
  | DateFieldGroupByDefinition
  | undefined;

const isGroupByDateFieldDefinition = (
  fieldGroupByDefinition: FieldGroupByDefinition,
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
  objectMetadataMaps: ObjectMetadataMaps,
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

      const isGroupByRelationField =
        isFieldMetadataRelationOrMorphRelation(fieldMetadata) &&
        typeof fieldNames[fieldName] === 'object' &&
        fieldNames[fieldName] !== null &&
        !isGroupByDateFieldDefinition(fieldNames[fieldName]);

      // Handle relation fields
      if (isGroupByRelationField) {
        const nestedFieldGroupByDefinitions = fieldNames[fieldName] as
          | Record<string, boolean>
          | Record<string, CompositeFieldGroupByDefinition>
          | Record<string, DateFieldGroupByDefinition>;

        const targetObjectMetadata = getTargetObjectMetadataOrThrow(
          fieldMetadata,
          objectMetadataMaps,
        );

        const nestedFieldNames = Object.keys(nestedFieldGroupByDefinitions);

        if (nestedFieldNames.length > 1) {
          throw new GraphqlQueryRunnerException(
            'You cannot provide multiple nested fields in one relation GroupByInput, split them into multiple GroupByInput',
            GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          );
        }

        const nestedFieldName = nestedFieldNames[0];
        const nestedFieldMetadataId =
          targetObjectMetadata.fieldIdByName[nestedFieldName];
        const nestedFieldMetadata =
          targetObjectMetadata.fieldsById[nestedFieldMetadataId];

        if (
          !isDefined(nestedFieldMetadata) ||
          !isDefined(nestedFieldMetadataId)
        ) {
          throw new GraphqlQueryRunnerException(
            `Nested field "${nestedFieldName}" not found in target object "${targetObjectMetadata.nameSingular}"`,
            GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
          );
        }

        if (nestedFieldMetadata.type === FieldMetadataType.RELATION) {
          throw new UserInputError(
            `Cannot group by a relation field of the relation field: "${nestedFieldName}" is a relation field of "${targetObjectMetadata.nameSingular}"`,
          );
        }

        const nestedFieldGroupByDefinition =
          nestedFieldGroupByDefinitions[nestedFieldName];

        // Handle date fields in nested relations
        if (
          (nestedFieldMetadata.type === FieldMetadataType.DATE ||
            nestedFieldMetadata.type === FieldMetadataType.DATE_TIME) &&
          isGroupByDateFieldDefinition(nestedFieldGroupByDefinition)
        ) {
          groupByFields.push({
            fieldMetadata,
            nestedFieldMetadata,
            dateGranularity: (
              nestedFieldGroupByDefinition as {
                granularity: ObjectRecordGroupByDateGranularity;
              }
            ).granularity,
          });
          continue;
        }

        // Handle composite fields in nested relations
        if (isCompositeFieldMetadataType(nestedFieldMetadata.type)) {
          if (
            typeof nestedFieldGroupByDefinition === 'object' &&
            nestedFieldGroupByDefinition !== null
          ) {
            const compositeSubFields = Object.keys(
              nestedFieldGroupByDefinition as Record<string, unknown>,
            );

            if (compositeSubFields.length > 1) {
              throw new GraphqlQueryRunnerException(
                'You cannot provide multiple composite subfields in one GroupByInput, split them into multiple GroupByInput',
                GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              );
            }

            const nestedSubFieldName = compositeSubFields[0];

            if (
              (nestedFieldGroupByDefinition as Record<string, boolean>)[
                nestedSubFieldName
              ] === true
            ) {
              groupByFields.push({
                fieldMetadata,
                nestedFieldMetadata,
                nestedSubFieldName,
              });
              continue;
            }
          }
          throw new GraphqlQueryRunnerException(
            `Composite field "${nestedFieldName}" requires a subfield to be specified`,
            GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          );
        }

        // Handle regular nested fields
        if (nestedFieldGroupByDefinition === true) {
          groupByFields.push({
            fieldMetadata,
            nestedFieldMetadata,
          });
          continue;
        }
      }

      // Handle date fields
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

      // Handle regular fields and composite fields
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
