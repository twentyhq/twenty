import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type CompositeFieldGroupByDefinition } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/types/composite-field-group-by-definition.type';
import { isGroupByDateFieldDefinition } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/is-group-by-date-field-definition.util';
import { isRelationNestedFieldSupportedInGroupBy } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/is-relation-nested-field-supported-in-group-by.util';
import { validateSingleKeyForGroupByOrThrow } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/validate-single-key-for-group-by-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type GroupByField } from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getGroupableSubFieldsForCompositeType } from 'src/engine/metadata-modules/field-metadata/utils/get-groupable-sub-fields-for-composite-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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
  const nestedFieldGroupByDefinitions = fieldNames[fieldName];

  if (!isPlainObject(nestedFieldGroupByDefinitions)) {
    throw new CommonQueryRunnerException(
      `Invalid groupBy definition for relation field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
    throw new CommonQueryRunnerException(
      `Relation target object metadata id not found for field ${fieldMetadata.name}`,
      CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(targetObjectMetadata)) {
    throw new CommonQueryRunnerException(
      `Target object metadata not found for relation field ${fieldMetadata.name}`,
      CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

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
  const nestedFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: nestedFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(nestedFieldMetadata) || !isDefined(nestedFieldMetadataId)) {
    throw new CommonQueryRunnerException(
      `Nested field "${nestedFieldName}" not found in target object "${targetObjectMetadata.nameSingular}"`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (
    !isRelationNestedFieldSupportedInGroupBy({
      nestedFieldName,
      nestedFieldMetadata,
    })
  ) {
    throw new CommonQueryRunnerException(
      `Nested field "${nestedFieldName}" is not supported in groupBy`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (nestedFieldMetadata.type === FieldMetadataType.RELATION) {
    throw new CommonQueryRunnerException(
      `Cannot group by a relation field of the relation field: "${nestedFieldName}" is a relation field of "${targetObjectMetadata.nameSingular}"`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
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

const validateAndTransformNestedCompositeFieldOrThrow = ({
  nestedFieldGroupByDefinition,
  nestedFieldName,
  fieldMetadata,
  nestedFieldMetadata,
  groupByFields,
}: {
  nestedFieldGroupByDefinition: unknown;
  nestedFieldName: string;
  fieldMetadata: FlatFieldMetadata;
  nestedFieldMetadata: FlatFieldMetadata;
  groupByFields: GroupByField[];
}) => {
  if (!isPlainObject(nestedFieldGroupByDefinition)) {
    throw new CommonQueryRunnerException(
      `Composite field "${nestedFieldName}" requires a subfield to be specified`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const compositeSubFields = Object.keys(nestedFieldGroupByDefinition);

  validateSingleKeyForGroupByOrThrow({
    groupByKeys: compositeSubFields,
    errorMessage:
      'You cannot provide multiple composite subfields in one GroupByInput, split them into multiple GroupByInput',
  });

  const nestedSubFieldName = compositeSubFields[0];
  const supportedCompositeSubFields = getGroupableSubFieldsForCompositeType(
    nestedFieldMetadata.type,
  );

  if (
    !supportedCompositeSubFields?.includes(nestedSubFieldName) ||
    nestedFieldGroupByDefinition[nestedSubFieldName] !== true
  ) {
    throw new CommonQueryRunnerException(
      `Composite subfield "${nestedSubFieldName}" is not supported in groupBy for "${nestedFieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  groupByFields.push({
    fieldMetadata,
    nestedFieldMetadata,
    nestedSubFieldName,
  });
};

export const validateAndTransformRelationGroupByFieldOrThrow = ({
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

  if (isCompositeFieldMetadataType(nestedFieldMetadata.type)) {
    validateAndTransformNestedCompositeFieldOrThrow({
      nestedFieldGroupByDefinition,
      nestedFieldName,
      fieldMetadata,
      nestedFieldMetadata,
      groupByFields,
    });

    return;
  }

  if (nestedFieldGroupByDefinition === true) {
    groupByFields.push({
      fieldMetadata,
      nestedFieldMetadata,
    });

    return;
  }

  throw new CommonQueryRunnerException(
    `Invalid groupBy definition for nested field "${fieldName}.${nestedFieldName}"`,
    CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};
