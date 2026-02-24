import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { validateBooleanFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-boolean-field-or-throw.util';
import { validateDateFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-date-field-or-throw.util';
import { validateDateTimeFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-date-time-field-or-throw.util';
import { validateNumberFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-number-field-or-throw.util';
import { validateUUIDFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-uuid-field-or-throw.util';
import {
  ARRAY_FILTER_OPERATORS,
  BOOLEAN_FILTER_OPERATORS,
  DATE_FILTER_OPERATORS,
  ENUM_FILTER_OPERATORS,
  MULTI_SELECT_FILTER_OPERATORS,
  NUMBER_FILTER_OPERATORS,
  RAW_JSON_FILTER_OPERATORS,
  RICH_TEXT_V2_FILTER_OPERATORS,
  STRING_FILTER_OPERATORS,
  UUID_FILTER_OPERATORS,
} from 'src/engine/api/common/common-args-processors/filter-arg-processor/constants/filter-operators.constant';
import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class FilterArgProcessor {
  process<T extends ObjectRecordFilter | undefined>({
    filter,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }: {
    filter: T;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): T {
    if (!isDefined(filter)) {
      return filter;
    }

    const { fieldIdByName, fieldIdByJoinColumnName } =
      buildFieldMapsFromFlatObjectMetadata(
        flatFieldMetadataMaps,
        flatObjectMetadata,
      );

    return this.validateAndTransformFilter(
      filter,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      fieldIdByName,
      fieldIdByJoinColumnName,
    ) as T;
  }

  private validateAndTransformFilter(
    filterObject: ObjectRecordFilter,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
  ): ObjectRecordFilter {
    const transformedFilter: ObjectRecordFilter = {};

    for (const [key, value] of Object.entries(filterObject)) {
      if (key === 'and' || key === 'or') {
        transformedFilter[key] = (value as ObjectRecordFilter[]).map(
          (nestedFilter) =>
            this.validateAndTransformFilter(
              nestedFilter,
              flatObjectMetadata,
              flatFieldMetadataMaps,
              fieldIdByName,
              fieldIdByJoinColumnName,
            ),
        );
        continue;
      }

      if (key === 'not') {
        transformedFilter[key] = this.validateAndTransformFilter(
          value as ObjectRecordFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          fieldIdByName,
          fieldIdByJoinColumnName,
        );
        continue;
      }

      transformedFilter[key] = this.validateAndTransformFieldFilter(
        key,
        value,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        fieldIdByName,
        fieldIdByJoinColumnName,
      );
    }

    return transformedFilter;
  }

  private validateAndTransformFieldFilter(
    key: string,
    filterValue: Record<string, unknown>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
  ): Record<string, unknown> {
    const fieldMetadataId = fieldIdByName[key] || fieldIdByJoinColumnName[key];

    if (!isDefined(fieldMetadataId)) {
      const nameSingular = flatObjectMetadata.nameSingular;

      throw new CommonQueryRunnerException(
        `Object ${flatObjectMetadata.nameSingular} doesn't have any "${key}" field.`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter : ${nameSingular} object doesn't have any "${key}" field.`,
        },
      );
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>(
      {
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      },
    );

    if (!fieldMetadata) {
      throw new CommonQueryRunnerException(
        `Field metadata not found for field ${key}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      return this.validateAndTransformCompositeFieldFilter(
        fieldMetadata,
        filterValue,
      );
    }

    return this.validateAndTransformOperatorAndValue(
      key,
      filterValue,
      fieldMetadata,
    );
  }

  private validateAndTransformCompositeFieldFilter(
    fieldMetadata: FlatFieldMetadata,
    filterValue: Record<string, unknown>,
  ): Record<string, unknown> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new CommonQueryRunnerException(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const transformedFilter: Record<string, unknown> = {};

    for (const [subFieldKey, subFieldFilter] of Object.entries(filterValue)) {
      const subFieldMetadata = compositeType.properties.find(
        (property) => property.name === subFieldKey,
      );

      if (!subFieldMetadata) {
        throw new CommonQueryRunnerException(
          `Sub field "${subFieldKey}" not found for composite type: ${fieldMetadata.type}`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      transformedFilter[subFieldKey] =
        this.validateAndTransformOperatorAndValue(
          `${fieldMetadata.name}.${subFieldKey}`,
          subFieldFilter as Record<string, unknown>,
          {
            ...fieldMetadata,
            type: subFieldMetadata.type as FieldMetadataType,
          },
        );
    }

    return transformedFilter;
  }

  private validateAndTransformOperatorAndValue(
    fieldName: string,
    filterValue: Record<string, unknown>,
    fieldMetadata: FlatFieldMetadata,
  ): Record<string, unknown> {
    const entries = Object.entries(filterValue);

    if (entries.length !== 1) {
      throw new CommonQueryRunnerException(
        `Filter for field "${fieldName}" must have exactly one operator`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter: exactly one operator per field is required`,
        },
      );
    }

    const [[operator, value]] = entries;

    this.validateOperatorForFieldTypeOrThrow(
      operator as FilterOperator,
      fieldMetadata,
      fieldName,
    );

    const transformedValue = this.validateAndTransformValueOrThrow(
      operator as FilterOperator,
      value,
      fieldMetadata,
      fieldName,
    );

    return { [operator]: transformedValue };
  }

  private validateOperatorForFieldTypeOrThrow(
    operator: FilterOperator,
    fieldMetadata: FlatFieldMetadata,
    fieldName: string,
  ): void {
    const allowedOperators = this.getOperatorsForFieldType(fieldMetadata.type);

    if (!allowedOperators.includes(operator)) {
      const fieldType = fieldMetadata.type;
      const allowedOperatorsString = allowedOperators.join(', ');

      throw new CommonQueryRunnerException(
        `Operator "${operator}" is not valid for field "${fieldName}" of type ${fieldType} - Allowed operators: ${allowedOperatorsString}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter : Operator "${operator}" is not valid for this "${fieldName}" ${fieldType} field`,
        },
      );
    }
  }

  private getOperatorsForFieldType(
    fieldType: FieldMetadataType,
  ): FilterOperator[] {
    switch (fieldType) {
      case FieldMetadataType.TEXT:
      case FieldMetadataType.RICH_TEXT:
        return STRING_FILTER_OPERATORS;

      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.POSITION:
        return NUMBER_FILTER_OPERATORS;

      case FieldMetadataType.BOOLEAN:
        return BOOLEAN_FILTER_OPERATORS;

      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME:
        return DATE_FILTER_OPERATORS;

      case FieldMetadataType.UUID:
      case FieldMetadataType.RELATION:
      case FieldMetadataType.MORPH_RELATION:
        return UUID_FILTER_OPERATORS;

      case FieldMetadataType.ARRAY:
        return ARRAY_FILTER_OPERATORS;

      case FieldMetadataType.MULTI_SELECT:
        return MULTI_SELECT_FILTER_OPERATORS;

      case FieldMetadataType.SELECT:
      case FieldMetadataType.RATING:
        return ENUM_FILTER_OPERATORS;

      case FieldMetadataType.RAW_JSON:
      case FieldMetadataType.FILES:
        return RAW_JSON_FILTER_OPERATORS;

      case FieldMetadataType.RICH_TEXT_V2:
        return RICH_TEXT_V2_FILTER_OPERATORS;

      default:
        return ['eq', 'neq', 'is'];
    }
  }

  private validateAndTransformValueOrThrow(
    operator: FilterOperator,
    value: unknown,
    fieldMetadata: FlatFieldMetadata,
    fieldName: string,
  ): unknown {
    switch (operator) {
      case 'is':
        this.validateIsOperatorValueOrThrow(value);

        return value;

      case 'isEmptyArray':
        this.validateIsEmptyArrayOperatorValueOrThrow(value, fieldName);

        return value;

      case 'in':
        this.validateArrayOperatorValueOrThrow(value, operator, fieldName);

        return this.validateAndTransformArrayItemsOrThrow(
          value as unknown[],
          fieldMetadata,
          fieldName,
        );

      case 'containsAny':
        this.validateArrayOperatorValueOrThrow(value, operator, fieldName);

        return value;

      case 'eq':
      case 'neq':
      case 'gt':
      case 'gte':
      case 'lt':
      case 'lte':
        return this.validateAndTransformValueByFieldTypeOrThrow(
          value,
          fieldMetadata,
          fieldName,
        );

      default:
        return value;
    }
  }

  private validateIsOperatorValueOrThrow(value: unknown): void {
    if (value !== 'NULL' && value !== 'NOT_NULL') {
      throw new CommonQueryRunnerException(
        `Invalid filter value for "is" operator. Expected "NULL" or "NOT_NULL"`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: msg`Invalid value for "is" operator` },
      );
    }
  }

  private validateIsEmptyArrayOperatorValueOrThrow(
    value: unknown,
    fieldName: string,
  ): void {
    if (typeof value !== 'boolean') {
      throw new CommonQueryRunnerException(
        `Filter operator "isEmptyArray" requires a boolean value for field ${fieldName}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter: "isEmptyArray" operator requires a boolean`,
        },
      );
    }
  }

  private validateArrayOperatorValueOrThrow(
    value: unknown,
    operator: FilterOperator,
    fieldName: string,
  ): void {
    if (!Array.isArray(value)) {
      throw new CommonQueryRunnerException(
        `Filter operator "${operator}" requires an array value for field ${fieldName}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter: "${operator}" operator requires an array`,
        },
      );
    }
  }

  private validateAndTransformArrayItemsOrThrow(
    values: unknown[],
    fieldMetadata: FlatFieldMetadata,
    fieldName: string,
  ): unknown[] {
    return values.map((item) => {
      if (item === null) {
        return item;
      }

      return this.validateAndTransformValueByFieldTypeOrThrow(
        item,
        fieldMetadata,
        fieldName,
      );
    });
  }

  private validateAndTransformValueByFieldTypeOrThrow(
    value: unknown,
    fieldMetadata: FlatFieldMetadata,
    fieldName: string,
  ): unknown {
    const fieldType = fieldMetadata.type;
    const exceptionCode = CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER;
    const coercedValue = this.coerceValueForFieldType(value, fieldType);

    switch (fieldType) {
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.POSITION:
        validateNumberFieldOrThrow(coercedValue, fieldName, exceptionCode);

        return coercedValue;

      case FieldMetadataType.BOOLEAN:
        validateBooleanFieldOrThrow(coercedValue, fieldName, exceptionCode);

        return coercedValue;

      case FieldMetadataType.UUID:
      case FieldMetadataType.RELATION:
      case FieldMetadataType.MORPH_RELATION:
        validateUUIDFieldOrThrow(coercedValue, fieldName, exceptionCode);

        return coercedValue;

      case FieldMetadataType.DATE:
        validateDateFieldOrThrow(coercedValue, fieldName, exceptionCode);

        return coercedValue;

      case FieldMetadataType.DATE_TIME:
        validateDateTimeFieldOrThrow(coercedValue, fieldName, exceptionCode);

        return coercedValue;

      default:
        return value;
    }
  }

  private coerceValueForFieldType(
    value: unknown,
    fieldType: FieldMetadataType,
  ): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    switch (fieldType) {
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.POSITION:
        return parseFloat(value);

      case FieldMetadataType.BOOLEAN:
        return value.toLowerCase() === 'true';

      default:
        return value;
    }
  }
}
