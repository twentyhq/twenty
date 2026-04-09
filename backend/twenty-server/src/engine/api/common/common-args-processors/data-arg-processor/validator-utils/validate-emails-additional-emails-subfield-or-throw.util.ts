import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import { validateEmailsPrimaryEmailSubfieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-emails-primary-email-subfield-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateEmailsAdditionalEmailsSubfieldOrThrow = (
  value: unknown,
  fieldName: string,
): string | string[] | null => {
  if (isNull(value)) return null;

  if (typeof value === 'string') {
    return validateEmailsPrimaryEmailSubfieldOrThrow(value, fieldName);
  }

  if (
    !Array.isArray(value) ||
    value.some((item) =>
      isNull(validateEmailsPrimaryEmailSubfieldOrThrow(item, fieldName)),
    )
  ) {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid value ${inspectedValue} for field "${fieldName} - Array values need to be string"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value: "${inspectedValue}"` },
    );
  }

  return value;
};
