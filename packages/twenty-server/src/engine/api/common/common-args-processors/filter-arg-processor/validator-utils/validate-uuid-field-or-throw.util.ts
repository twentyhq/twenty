import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isNull } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateUUIDFieldOrThrow = (
  value: unknown,
  fieldName: string,
): string | null => {
  if (
    (!isNonEmptyString(value) && !isNull(value)) ||
    (isNonEmptyString(value) && !isValidUuid(value))
  ) {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid UUID value ${inspectedValue} for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      { userFriendlyMessage: msg`Invalid value for UUID: "${inspectedValue}"` },
    );
  }

  return value as string;
};
