import { inspect } from 'util';

import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

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
    );
  }

  if (!isNull(preValidatedValue) && !options.includes(preValidatedValue)) {
    throw new CommonQueryRunnerException(
      `Invalid value ${inspect(value)} for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    );
  }

  return preValidatedValue;
};
