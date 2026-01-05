import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateBooleanFieldOrThrow = (
  value: unknown,
  fieldName: string,
): boolean | null => {
  if (typeof value !== 'boolean' && !isNull(value)) {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid boolean value ${inspect(value)} for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value: "${inspectedValue}"` },
    );
  }

  return value;
};
