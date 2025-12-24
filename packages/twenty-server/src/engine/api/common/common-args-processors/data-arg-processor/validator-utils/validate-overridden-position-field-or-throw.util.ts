import { inspect } from 'util';

import { msg } from '@lingui/core/macro';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateOverriddenPositionFieldOrThrow = (
  value: unknown,
  fieldName: string,
): number | null => {
  if (
    typeof value !== 'number' ||
    (typeof value === 'number' &&
      (isNaN(value) || value === Infinity || value === -Infinity))
  ) {
    throw new CommonQueryRunnerException(
      `Invalid position value ${inspect(value)} for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value for position.` },
    );
  }

  return value;
};
