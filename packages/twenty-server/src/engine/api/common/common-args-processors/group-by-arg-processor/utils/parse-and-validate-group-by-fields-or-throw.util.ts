import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type GroupByField } from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { isGroupByDateFieldDefinition } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/is-group-by-date-field-definition.util';
import { parseGroupByRelationField } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/parse-group-by-relation-field.util';
import { validateSingleKeyForGroupByOrThrow } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/validate-single-key-for-group-by-or-throw.util';
import {
  ObjectRecordGroupByForAtomicField,
  ObjectRecordGroupByForCompositeField,
  ObjectRecordGroupByForDateField,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  getGroupableSubFieldsForCompositeType,
  isFlatFieldMetadataSupportedInGroupBy,
} from 'src/engine/metadata-modules/field-metadata/utils/is-supported-in-group-by.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const parseAndValidateGroupByFieldsOrThrow = ({
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

      if (!isFlatFieldMetadataSupportedInGroupBy(fieldMetadata)) {
        throw new CommonQueryRunnerException(
          `Field "${fieldName}" is not supported in groupBy`,
          CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const isGroupByRelationField =
        isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
        typeof fieldNames[fieldName] === 'object' &&
        fieldNames[fieldName] !== null &&
        !isGroupByDateFieldDefinition(fieldNames[fieldName]);

      const isGroupByRelationJoinColumnField =
        isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
        fieldNames[fieldName] === true &&
        isDefined(fieldIdByJoinColumnName[fieldName]);

      if (isGroupByRelationField || isGroupByRelationJoinColumnField) {
        const normalizedFieldNames = isGroupByRelationJoinColumnField
          ? { ...fieldNames, [fieldName]: { id: true } }
          : fieldNames;

        parseGroupByRelationField({
          fieldNames: normalizedFieldNames,
          fieldName,
          fieldMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          groupByFields,
        });

        continue;
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
            weekStartDay: fieldGroupByDefinition.weekStartDay,
            timeZone: fieldGroupByDefinition.timeZone,
          });
          continue;
        }
      }

      if (
        typeof fieldNames[fieldName] === 'object' &&
        fieldNames[fieldName] !== null &&
        'unnest' in fieldNames[fieldName]
      ) {
        groupByFields.push({
          fieldMetadata,
          subFieldName: undefined,
          shouldUnnest: true,
        });
        continue;
      }

      if (fieldNames[fieldName] === true) {
        groupByFields.push({
          fieldMetadata,
          subFieldName: undefined,
        });
        continue;
      }

      if (
        typeof fieldNames[fieldName] === 'object' &&
        fieldNames[fieldName] !== null
      ) {
        if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
          throw new CommonQueryRunnerException(
            `Field "${fieldName}" does not support nested subfields in groupBy`,
            CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
            { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
          );
        }

        const supportedCompositeSubFields =
          getGroupableSubFieldsForCompositeType(fieldMetadata.type);

        validateSingleKeyForGroupByOrThrow({
          groupByKeys: Object.keys(fieldNames[fieldName]),
          errorMessage:
            'You cannot provide multiple subfields in one GroupByInput, split them into multiple GroupByInput',
        });

        for (const subFieldName of Object.keys(fieldNames[fieldName])) {
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

          if (
            (fieldNames[fieldName] as Record<string, boolean>)[subFieldName] !==
            true
          ) {
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

        continue;
      }

      throw new CommonQueryRunnerException(
        `Invalid groupBy definition for field "${fieldName}"`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  return groupByFields;
};
