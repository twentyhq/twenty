import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isDate, isNull, isString } from '@sniptt/guards';
import { isValid, parse } from 'date-fns';
import { ACCEPTED_DATE_FORMATS } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const isValidDateFormat = (value: string): boolean => {
  for (const format of ACCEPTED_DATE_FORMATS) {
    const parsed = parse(value, format, new Date());

    if (isValid(parsed)) {
      return true;
    }
  }

  return false;
};

export const validateDateFieldOrThrow = (
  value: unknown,
  fieldName: string,
): unknown => {
  if (isNull(value)) return null;

  if (isDate(value) && isValid(value)) {
    return value;
  }

  if (isString(value) && isValidDateFormat(value)) {
    return value;
  }

  const inspectedValue = inspect(value);

  throw new CommonQueryRunnerException(
    `Invalid value ${inspectedValue} for date field "${fieldName}". Expected format: 'YYYY-MM-DD'`,
    CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
    {
      userFriendlyMessage: msg`Invalid value for date: "${inspectedValue}". Expected format: 'YYYY-MM-DD'`,
    },
  );
};
