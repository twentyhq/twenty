import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isNull } from '@sniptt/guards';
import { emailSchema } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { normalizeEmailForStorage } from 'src/utils/normalize-email-for-storage.util';

export const validateEmailsPrimaryEmailSubfieldOrThrow = (
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

  const canonicalEmail = normalizeEmailForStorage(value);

  if (
    !emailSchema.safeParse(canonicalEmail).success &&
    isNonEmptyString(canonicalEmail)
  ) {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid string value ${inspectedValue} for email field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value: "${inspectedValue}"` },
    );
  }

  return canonicalEmail;
};
