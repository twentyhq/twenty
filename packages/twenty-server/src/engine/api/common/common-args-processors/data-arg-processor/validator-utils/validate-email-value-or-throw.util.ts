import { inspect } from 'util';

import { isNull } from '@sniptt/guards';
import { msg } from '@lingui/core/macro';
import { z } from 'zod';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateEmailValueOrThrow = (
  value: unknown,
  fieldName: string,
): string | null => {
  if (isNull(value)) return null;

  if (typeof value !== 'string') {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid string value ${inspectedValue} for email field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value: "${inspectedValue}"` },
    );
  }

  if (
    value !== value.toLowerCase() ||
    !z.email().trim().safeParse(value).success
  ) {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid string value ${inspectedValue} for email field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value: "${inspectedValue}"` },
    );
  }

  return value;
};
