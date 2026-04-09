import { msg } from '@lingui/core/macro';

import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import type { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { validateAndTransformValueOrThrow } from './validate-and-transform-value-or-throw.util';
import { validateOperatorForFieldTypeOrThrow } from './validate-operator-for-field-type-or-throw.util';

export const validateAndTransformOperatorAndValue = (
  fieldName: string,
  filterValue: Record<string, unknown>,
  fieldMetadata: FlatFieldMetadata,
): Record<string, unknown> => {
  if (filterValue === null || typeof filterValue !== 'object') {
    throw new CommonQueryRunnerException(
      `Filter value for field "${fieldName}" must be an object`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: filter value must be an object`,
      },
    );
  }

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

  validateOperatorForFieldTypeOrThrow(
    operator as FilterOperator,
    fieldMetadata,
    fieldName,
  );

  const transformedValue = validateAndTransformValueOrThrow(
    operator as FilterOperator,
    value,
    fieldMetadata,
    fieldName,
  );

  return { [operator]: transformedValue };
};
