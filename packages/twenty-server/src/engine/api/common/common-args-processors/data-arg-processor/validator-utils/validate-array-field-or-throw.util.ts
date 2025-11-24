import { inspect } from 'util';

import { isNull } from '@sniptt/guards';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateArrayFieldOrThrow = (
  value: unknown,
  fieldName: string,
): string | string[] | null => {
  if (isNull(value)) return null;

  if (typeof value === 'string') return value;

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new CommonQueryRunnerException(
      `Invalid value ${inspect(value)} for field "${fieldName} - Array values need to be string"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    );
  }

  return value;
};
