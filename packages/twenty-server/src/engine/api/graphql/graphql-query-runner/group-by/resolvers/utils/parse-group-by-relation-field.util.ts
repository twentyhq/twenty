import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type CompositeFieldGroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/composite-field-group-by-definition.type';
import { type DateFieldGroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/date-field-group-by-definition.type';
import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { isGroupByDateFieldDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-date-field-definition.util';
import { validateSingleKeyForGroupByOrThrow } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/validate-single-key-for-group-by-or-throw.util';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const getNestedFieldMetadataDetails = ({
  fieldNames,
  fieldName,
  fieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  fieldNames: Record<string, unknown>;
  fieldName: string;
  fieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  const nestedFieldGroupByDefinitions = fieldNames[fieldName] as
    | Record<string, boolean>
    | Record<string, CompositeFieldGroupByDefinition>
    | Record<string, DateFieldGroupByDefinition>;

  if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
    throw new UserInputError(
      `Relation target object metadata id not found for field ${fieldMetadata.name}`,
    );
  }

  const targetObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const nestedFieldNames = Object.keys(nestedFieldGroupByDefinitions);

  validateSingleKeyForGroupByOrThrow({
    groupByKeys: nestedFieldNames,
    errorMessage:
      'You cannot provide multiple nested fields in one relation GroupByInput, split them into multiple GroupByInput',
  });

  const nestedFieldName = nestedFieldNames[0];
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    targetObjectMetadata,
  );

  const nestedFieldMetadataId = fieldIdByName[nestedFieldName];
  const nestedFieldMetadata = flatFieldMetadataMaps.byId[nestedFieldMetadataId];

  if (!isDefined(nestedFieldMetadata) || !isDefined(nestedFieldMetadataId)) {
    throw new GraphqlQueryRunnerException(
      `Nested field "${nestedFieldName}" not found in target object "${targetObjectMetadata.nameSingular}"`,
      GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
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
  fieldMetadata: FlatFieldMetadata;
  nestedFieldMetadata: FlatFieldMetadata;
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
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

export const parseGroupByRelationField = ({
  fieldNames,
  fieldName,
  fieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  groupByFields,
}: {
  fieldNames: Record<string, unknown>;
  fieldName: string;
  fieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  groupByFields: GroupByField[];
}) => {
  const { nestedFieldGroupByDefinition, nestedFieldMetadata, nestedFieldName } =
    getNestedFieldMetadataDetails({
      fieldNames,
      fieldName,
      fieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

  // Handle date fields in nested relations
  if (
    (nestedFieldMetadata.type === FieldMetadataType.DATE ||
      nestedFieldMetadata.type === FieldMetadataType.DATE_TIME) &&
    isGroupByDateFieldDefinition(nestedFieldGroupByDefinition)
  ) {
    const dateFieldDefinition = nestedFieldGroupByDefinition;

    groupByFields.push({
      fieldMetadata,
      nestedFieldMetadata,
      dateGranularity: dateFieldDefinition.granularity,
      weekStartDay: dateFieldDefinition.weekStartDay,
      timeZone: dateFieldDefinition.timeZone,
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
