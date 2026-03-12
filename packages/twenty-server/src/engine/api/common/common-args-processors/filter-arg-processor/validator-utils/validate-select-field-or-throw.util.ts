import { msg } from '@lingui/core/macro';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const validateSelectFieldOrThrow = (
  value: unknown,
  fieldMetadata: FlatFieldMetadata,
  fieldName: string,
): string => {
  if (typeof value !== 'string') {
    throw new CommonQueryRunnerException(
      `Invalid select value for field "${fieldName}": expected string, got ${typeof value}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter value for field "${fieldName}"`,
      },
    );
  }

  const validOptions = fieldMetadata.options?.map((option) => option.value);

  if (validOptions && validOptions.length > 0 && !validOptions.includes(value)) {
    throw new CommonQueryRunnerException(
      `Invalid select value "${value}" for field "${fieldName}". Valid options: ${validOptions.join(', ')}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter value "${value}" for field "${fieldName}"`,
      },
    );
  }

  return value;
};
