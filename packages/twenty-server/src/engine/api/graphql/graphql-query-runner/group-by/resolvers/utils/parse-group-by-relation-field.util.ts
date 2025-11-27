import { UserInputError } from 'apollo-server-core';
import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type CompositeFieldGroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/composite-field-group-by-definition.type';
import { type DateFieldGroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/date-field-group-by-definition.type';
import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { isGroupByDateFieldDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field-definition.util';
import { validateSingleKeyForGroupByOrThrow } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/validate-single-key-for-group-by-or-throw.util';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

const getNestedFieldMetadataDetails = ({
  fieldNames,
  fieldName,
  fieldMetadata,
  objectMetadataMaps,
}: {
  fieldNames: Record<string, unknown>;
  fieldName: string;
  fieldMetadata: FieldMetadataEntity;
  objectMetadataMaps: ObjectMetadataMaps;
}) => {
  const nestedFieldGroupByDefinitions = fieldNames[fieldName] as
    | Record<string, boolean>
    | Record<string, CompositeFieldGroupByDefinition>
    | Record<string, DateFieldGroupByDefinition>;

  const targetObjectMetadata = getTargetObjectMetadataOrThrow(
    fieldMetadata,
    objectMetadataMaps,
  );

  const nestedFieldNames = Object.keys(nestedFieldGroupByDefinitions);

  validateSingleKeyForGroupByOrThrow({
    groupByKeys: nestedFieldNames,
    errorMessage:
      'You cannot provide multiple nested fields in one relation GroupByInput, split them into multiple GroupByInput',
  });

  const nestedFieldName = nestedFieldNames[0];
  const nestedFieldMetadataId =
    targetObjectMetadata.fieldIdByName[nestedFieldName];
  const nestedFieldMetadata =
    targetObjectMetadata.fieldsById[nestedFieldMetadataId];

  if (!isDefined(nestedFieldMetadata) || !isDefined(nestedFieldMetadataId)) {
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

  return {
    nestedFieldGroupByDefinition,
    nestedFieldMetadata,
    nestedFieldName,
  };
};

const handleNestedCompositeField = ({
  nestedFieldGroupByDefinition,
  nestedFieldName,
  fieldMetadata,
  nestedFieldMetadata,
  groupByFields,
}: {
  nestedFieldGroupByDefinition: CompositeFieldGroupByDefinition;
  nestedFieldName: string;
  fieldMetadata: FieldMetadataEntity;
  nestedFieldMetadata: FieldMetadataEntity;
  groupByFields: GroupByField[];
}) => {
  if (
    typeof nestedFieldGroupByDefinition === 'object' &&
    nestedFieldGroupByDefinition !== null
  ) {
    const compositeSubFields = Object.keys(
      nestedFieldGroupByDefinition as Record<string, unknown>,
    );

    validateSingleKeyForGroupByOrThrow({
      groupByKeys: compositeSubFields,
      errorMessage:
        'You cannot provide multiple composite subfields in one GroupByInput, split them into multiple GroupByInput',
    });

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

      return;
    }
  }
  throw new GraphqlQueryRunnerException(
    `Composite field "${nestedFieldName}" requires a subfield to be specified`,
    GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
  );
};

export const parseGroupByRelationField = ({
  fieldNames,
  fieldName,
  fieldMetadata,
  objectMetadataMaps,
  groupByFields,
}: {
  fieldNames: Record<string, unknown>;
  fieldName: string;
  fieldMetadata: FieldMetadataEntity;
  objectMetadataMaps: ObjectMetadataMaps;
  groupByFields: GroupByField[];
}) => {
  const { nestedFieldGroupByDefinition, nestedFieldMetadata, nestedFieldName } =
    getNestedFieldMetadataDetails({
      fieldNames,
      fieldName,
      fieldMetadata,
      objectMetadataMaps,
    });

  // Handle date fields in nested relations
  if (
    (nestedFieldMetadata.type === FieldMetadataType.DATE ||
      nestedFieldMetadata.type === FieldMetadataType.DATE_TIME) &&
    isGroupByDateFieldDefinition(nestedFieldGroupByDefinition)
  ) {
    const dateFieldDefinition =
      nestedFieldGroupByDefinition as DateFieldGroupByDefinition;

    groupByFields.push({
      fieldMetadata,
      nestedFieldMetadata,
      dateGranularity: dateFieldDefinition.granularity,
      weekStartDay: dateFieldDefinition.weekStartDay,
    });

    return;
  }

  // Handle composite fields in nested relations
  if (isCompositeFieldMetadataType(nestedFieldMetadata.type)) {
    handleNestedCompositeField({
      nestedFieldGroupByDefinition:
        nestedFieldGroupByDefinition as CompositeFieldGroupByDefinition,
      nestedFieldName,
      fieldMetadata,
      nestedFieldMetadata,
      groupByFields,
    });
  }

  // Handle regular nested fields
  if (nestedFieldGroupByDefinition === true) {
    groupByFields.push({
      fieldMetadata,
      nestedFieldMetadata,
    });

    return;
  }
};
