import { inspect } from 'util';

import { isNull } from '@sniptt/guards';
import { msg } from '@lingui/core/macro';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { validateEmailValueOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-email-value-or-throw.util';

export const validateAdditionalEmailArrayOrThrow = (
  value: unknown,
  fieldName: string,
): string | string[] | null => {
  if (isNull(value)) return null;

  if (typeof value === 'string') {
    return validateEmailValueOrThrow(value, fieldName);
  }

  if (
    !Array.isArray(value) ||
    value.forEach((item) => validateEmailValueOrThrow(item, fieldName) !== null)
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
