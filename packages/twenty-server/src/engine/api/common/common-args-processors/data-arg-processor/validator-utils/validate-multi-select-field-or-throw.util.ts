import { inspect } from 'util';

import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { validateArrayFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-array-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateMultiSelectFieldOrThrow = (
  value: unknown,
  fieldName: string,
  options?: string[],
): string | string[] | null => {
  const preValidatedValue = validateArrayFieldOrThrow(value, fieldName);

  if (isNull(preValidatedValue)) return null;

  if (!isDefined(options)) {
    throw new CommonQueryRunnerException(
      `Invalid options for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    );
  }

  if (
    (Array.isArray(preValidatedValue)
      ? preValidatedValue
      : [preValidatedValue]
    ).some((item) => !options.includes(item))
  ) {
    throw new CommonQueryRunnerException(
      `Invalid value ${inspect(value)} for multi select field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    );
  }

  return value as string | string[];
};
