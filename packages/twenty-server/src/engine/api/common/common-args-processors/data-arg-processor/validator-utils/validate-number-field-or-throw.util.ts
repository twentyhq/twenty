import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateNumberFieldOrThrow = (
  value: unknown,
  fieldName: string,
): number | null => {
  if (
    (typeof value !== 'number' && !isNull(value)) ||
    (typeof value === 'number' &&
      (isNaN(value) || value === Infinity || value === -Infinity))
  ) {
    throw new CommonQueryRunnerException(
      `Invalid number value ${inspect(value)} for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value for number.` },
    );
  }

  return value;
};
