import { inspect } from 'util';

import { isNull } from '@sniptt/guards';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateBooleanFieldOrThrow = (
  value: unknown,
  fieldName: string,
): boolean | null => {
  if (typeof value !== 'boolean' && !isNull(value))
    throw new CommonQueryRunnerException(
      `Invalid boolean value ${inspect(value)} for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    );

  return value;
};
