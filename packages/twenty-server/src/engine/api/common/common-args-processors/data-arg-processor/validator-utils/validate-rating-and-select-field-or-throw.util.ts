import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';

export const validateRatingAndSelectFieldOrThrow = (
  value: unknown,
  fieldName: string,
  options?: string[],
): string | null => {
  const preValidatedValue = validateTextFieldOrThrow(value, fieldName);

  if (!isDefined(options)) {
    throw new CommonQueryRunnerException(
      `Invalid options for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (!isNull(preValidatedValue) && !options.includes(preValidatedValue)) {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid value ${inspectedValue} for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      {
        userFriendlyMessage: msg`Invalid value for select: "${inspectedValue}"`,
      },
    );
  }

  return preValidatedValue;
};
