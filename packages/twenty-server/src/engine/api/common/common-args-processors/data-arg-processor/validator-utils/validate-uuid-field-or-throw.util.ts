import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateUUIDFieldOrThrow = (
  value: unknown,
  fieldName: string,
): string | null => {
  if (!isValidUuid(value as string) && !isNull(value)) {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid UUID value ${inspectedValue} for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value for UUID: "${inspectedValue}"` },
    );
  }

  return value as string;
};
