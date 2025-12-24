import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateTextFieldOrThrow = (
  value: unknown,
  fieldName: string,
): string | null => {
  if (typeof value !== 'string' && !isNull(value)) {
    throw new CommonQueryRunnerException(
      `Invalid string value ${inspect(value)} for text field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value for text.` },
    );
  }

  return value;
};
