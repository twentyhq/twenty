import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  ARRAY_FIELD_FILTER_OPERATORS,
  BOOLEAN_FILTER_OPERATORS,
  DATE_FILTER_OPERATORS,
  JSON_FILTER_OPERATORS,
  NUMBER_FILTER_OPERATORS,
  SELECT_FILTER_OPERATORS,
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

    this.validateFilterRecursive(
      filter,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      fieldIdByName,
      fieldIdByJoinColumnName,
    );

    return filter;
  }

  private validateFilterRecursive(
    filterObject: ObjectRecordFilter,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
  ): void {
    for (const [key, value] of Object.entries(filterObject)) {
      if (key === 'and' || key === 'or') {
        for (const nestedFilter of value as ObjectRecordFilter[]) {
          this.validateFilterRecursive(
            nestedFilter,
            flatObjectMetadata,
            flatFieldMetadataMaps,
            fieldIdByName,
            fieldIdByJoinColumnName,
          );
        }
        continue;
      }

      if (key === 'not') {
        this.validateFilterRecursive(
          value as ObjectRecordFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          fieldIdByName,
          fieldIdByJoinColumnName,
        );
        continue;
      }

      this.validateFieldFilter(
        key,
        value,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        fieldIdByName,
        fieldIdByJoinColumnName,
      );
    }
  }

  private validateFieldFilter(
    key: string,
    filterValue: unknown,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
  ): void {
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

    const fieldMetadata = flatFieldMetadataMaps.byId[fieldMetadataId];

    if (!fieldMetadata) {
      throw new CommonQueryRunnerException(
        `Field metadata not found for field ${key}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      this.validateCompositeFieldFilter(
        fieldMetadata,
        filterValue as Record<string, unknown>,
      );

      return;
    }

    this.validateOperatorAndValue(
      key,
      filterValue as Record<string, unknown>,
      fieldMetadata,
    );
  }

  private validateCompositeFieldFilter(
    fieldMetadata: FlatFieldMetadata,
    filterValue: Record<string, unknown>,
  ): void {
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

      this.validateOperatorAndValue(
        `${fieldMetadata.name}.${subFieldKey}`,
        subFieldFilter as Record<string, unknown>,
        { ...fieldMetadata, type: subFieldMetadata.type as FieldMetadataType },
      );
    }
  }

  private validateOperatorAndValue(
    fieldName: string,
    filterValue: Record<string, unknown>,
    fieldMetadata: FlatFieldMetadata,
  ): void {
    const entries = Object.entries(filterValue);

    if (entries.length === 0) {
      throw new CommonQueryRunnerException(
        `Filter for field "${fieldName}" must have at least one operator`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: msg`Invalid filter for field "${fieldName}"` },
      );
    }

    for (const [operator, value] of entries) {
      this.validateOperatorForFieldType(
        operator as FilterOperator,
        fieldMetadata,
        fieldName,
      );

      this.validateValueFormat(operator as FilterOperator, value, fieldName);
    }
  }

  private validateOperatorForFieldType(
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
      case FieldMetadataType.MULTI_SELECT:
        return ARRAY_FIELD_FILTER_OPERATORS;

      case FieldMetadataType.SELECT:
      case FieldMetadataType.RATING:
        return SELECT_FILTER_OPERATORS;

      case FieldMetadataType.RAW_JSON:
        return JSON_FILTER_OPERATORS;

      case FieldMetadataType.TS_VECTOR:
        return ['search', 'is'];

      default:
        return ['eq', 'neq', 'is'];
    }
  }

  private validateValueFormat(
    operator: FilterOperator,
    value: unknown,
    fieldName: string,
  ): void {
    if (operator === 'is') {
      if (value !== 'NULL' && value !== 'NOT_NULL') {
        throw new CommonQueryRunnerException(
          `Invalid filter value for "${operator}" operator on field ${fieldName}. Expected "NULL" or "NOT_NULL"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
          { userFriendlyMessage: msg`Invalid value for "is" operator` },
        );
      }

      return;
    }
  }
}
