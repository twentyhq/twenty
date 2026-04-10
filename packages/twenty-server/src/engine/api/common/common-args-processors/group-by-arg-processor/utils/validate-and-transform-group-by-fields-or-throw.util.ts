import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type GroupByField } from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { isGroupByDateFieldDefinition } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/is-group-by-date-field-definition.util';
import { validateAndTransformRelationGroupByFieldOrThrow } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/validate-and-transform-relation-group-by-field-or-throw.util';
import { validateSingleKeyForGroupByOrThrow } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/validate-single-key-for-group-by-or-throw.util';
import {
  ObjectRecordGroupByForAtomicField,
  ObjectRecordGroupByForCompositeField,
  ObjectRecordGroupByForDateField,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getGroupableSubFieldsForCompositeType } from 'src/engine/metadata-modules/field-metadata/utils/get-groupable-sub-fields-for-composite-type.util';
import { isFlatFieldMetadataSupportedInGroupBy } from 'src/engine/metadata-modules/field-metadata/utils/is-supported-in-group-by.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const getFieldMetadataForGroupByOrThrow = ({
  fieldName,
  fieldIdByName,
  fieldIdByJoinColumnName,
  flatFieldMetadataMaps,
}: {
  fieldName: string;
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadata => {
  const fieldMetadataId =
    fieldIdByName[fieldName] || fieldIdByJoinColumnName[fieldName];
  const fieldMetadata = fieldMetadataId
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  if (!isDefined(fieldMetadata) || !isDefined(fieldMetadataId)) {
    throw new CommonQueryRunnerException(
      `Unidentified field in groupBy: ${fieldName}`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  return fieldMetadata;
};

const validateAndTransformCompositeGroupByDefinitionOrThrow = ({
  fieldName,
  fieldMetadata,
  fieldGroupByDefinition,
  groupByFields,
}: {
  fieldName: string;
  fieldMetadata: FlatFieldMetadata;
  fieldGroupByDefinition: Record<string, unknown>;
  groupByFields: GroupByField[];
}) => {
  if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
    throw new CommonQueryRunnerException(
      `Field "${fieldName}" does not support nested subfields in groupBy`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const supportedCompositeSubFields = getGroupableSubFieldsForCompositeType(
    fieldMetadata.type,
  );

  validateSingleKeyForGroupByOrThrow({
    groupByKeys: Object.keys(fieldGroupByDefinition),
    errorMessage:
      'You cannot provide multiple subfields in one GroupByInput, split them into multiple GroupByInput',
  });

  for (const subFieldName of Object.keys(fieldGroupByDefinition)) {
    if (
      isCompositeFieldMetadataType(fieldMetadata.type) &&
      !supportedCompositeSubFields?.includes(subFieldName)
    ) {
      throw new CommonQueryRunnerException(
        `Composite subfield "${subFieldName}" is not supported in groupBy for "${fieldName}"`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (fieldGroupByDefinition[subFieldName] !== true) {
      throw new CommonQueryRunnerException(
        `Composite subfield "${subFieldName}" must be set to true in groupBy for "${fieldName}"`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    groupByFields.push({
      fieldMetadata,
      subFieldName,
    });
  }
};

const validateAndTransformSingleGroupByFieldOrThrow = ({
  fieldNames,
  fieldName,
  fieldIdByName,
  fieldIdByJoinColumnName,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  groupByFields,
}: {
  fieldNames: Record<string, unknown>;
  fieldName: string;
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  groupByFields: GroupByField[];
}) => {
  const fieldMetadata = getFieldMetadataForGroupByOrThrow({
    fieldName,
    fieldIdByName,
    fieldIdByJoinColumnName,
    flatFieldMetadataMaps,
  });

  if (!isFlatFieldMetadataSupportedInGroupBy(fieldMetadata)) {
    throw new CommonQueryRunnerException(
      `Field "${fieldName}" is not supported in groupBy`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const fieldGroupByDefinition = fieldNames[fieldName];
  const isObjectFieldGroupByDefinition = isPlainObject(fieldGroupByDefinition);
  const isGroupByRelationField =
    isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
    isObjectFieldGroupByDefinition &&
    !isGroupByDateFieldDefinition(fieldGroupByDefinition);
  const isGroupByRelationJoinColumnField =
    isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
    fieldGroupByDefinition === true &&
    isDefined(fieldIdByJoinColumnName[fieldName]);

  if (isGroupByRelationField || isGroupByRelationJoinColumnField) {
    const normalizedFieldNames = isGroupByRelationJoinColumnField
      ? { ...fieldNames, [fieldName]: { id: true } }
      : fieldNames;

    validateAndTransformRelationGroupByFieldOrThrow({
      fieldNames: normalizedFieldNames,
      fieldName,
      fieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      groupByFields,
    });

    return;
  }

  if (
    (fieldMetadata.type === FieldMetadataType.DATE ||
      fieldMetadata.type === FieldMetadataType.DATE_TIME) &&
    isGroupByDateFieldDefinition(fieldGroupByDefinition)
  ) {
    groupByFields.push({
      fieldMetadata,
      dateGranularity: fieldGroupByDefinition.granularity,
      weekStartDay: fieldGroupByDefinition.weekStartDay,
      timeZone: fieldGroupByDefinition.timeZone,
    });

    return;
  }

  if (isObjectFieldGroupByDefinition && 'unnest' in fieldGroupByDefinition) {
    groupByFields.push({
      fieldMetadata,
      subFieldName: undefined,
      shouldUnnest: true,
    });

    return;
  }

  if (fieldGroupByDefinition === true) {
    groupByFields.push({
      fieldMetadata,
      subFieldName: undefined,
    });

    return;
  }

  if (isObjectFieldGroupByDefinition) {
    validateAndTransformCompositeGroupByDefinitionOrThrow({
      fieldName,
      fieldMetadata,
      fieldGroupByDefinition,
      groupByFields,
    });

    return;
  }

  throw new CommonQueryRunnerException(
    `Invalid groupBy definition for field "${fieldName}"`,
    CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

export const validateAndTransformGroupByFieldsOrThrow = ({
  groupBy,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  groupBy: Array<
    | ObjectRecordGroupByForAtomicField
    | ObjectRecordGroupByForCompositeField
    | ObjectRecordGroupByForDateField
  >;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): GroupByField[] => {
  const groupByFields: GroupByField[] = [];

  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  for (const fieldNames of groupBy) {
    validateSingleKeyForGroupByOrThrow({
      groupByKeys: Object.keys(fieldNames),
      errorMessage:
        'You cannot provide multiple fields in one GroupByInput, split them into multiple GroupByInput',
    });

    for (const fieldName of Object.keys(fieldNames)) {
      validateAndTransformSingleGroupByFieldOrThrow({
        fieldNames,
        fieldName,
        fieldIdByName,
        fieldIdByJoinColumnName,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        groupByFields,
      });
    }
  }

  return groupByFields;
};
