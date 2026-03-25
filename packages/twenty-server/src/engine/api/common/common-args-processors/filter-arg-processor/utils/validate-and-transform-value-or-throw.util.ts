import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';
import type { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { validateAndTransformArrayItems } from './validate-and-transform-array-items.util';
import { validateAndTransformValueByFieldType } from './validate-and-transform-value-by-field-type.util';
import { validateArrayOperatorValueOrThrow } from './validate-array-operator-value-or-throw.util';
import { validateIsEmptyArrayOperatorValueOrThrow } from './validate-is-empty-array-operator-value-or-throw.util';
import { validateIsOperatorFilterValueOrThrow } from './validate-is-operator-filter-value-or-throw.util';

export const validateAndTransformValueOrThrow = (
  operator: FilterOperator,
  value: unknown,
  fieldMetadata: FlatFieldMetadata,
  fieldName: string,
): unknown => {
  switch (operator) {
    case 'is':
      validateIsOperatorFilterValueOrThrow(value);

      return value;

    case 'isEmptyArray':
      validateIsEmptyArrayOperatorValueOrThrow(value, fieldName);

      return value;

    case 'in':
      validateArrayOperatorValueOrThrow(value, operator, fieldName);

      return validateAndTransformArrayItems(
        value as unknown[],
        fieldMetadata,
        fieldName,
      );

    case 'containsAny':
      validateArrayOperatorValueOrThrow(value, operator, fieldName);

      return value;

    case 'eq':
    case 'neq':
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return validateAndTransformValueByFieldType(
        value,
        fieldMetadata,
        fieldName,
      );

    default:
      return value;
  }
};
