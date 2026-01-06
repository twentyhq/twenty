import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isDate, isNull, isNumber, isString } from '@sniptt/guards';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

// TODO: should be splitted in both validateDate and validateDateTime because both format are different even if Date parses them indeferrently
export const validateDateAndDateTimeFieldOrThrow = (
  value: unknown,
  fieldName: string,
) => {
  if (isNull(value)) return null;

  if (isString(value) || isNumber(value) || isDate(value)) {
    const date = new Date(value);

    if (!isNaN(date.getTime())) return value;
  }

  const inspectedValue = inspect(value);

  throw new CommonQueryRunnerException(
    `Invalid value ${inspectedValue} for date or date-time field "${fieldName}"`,
    CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    { userFriendlyMessage: msg`Invalid value for date: "${inspectedValue}"` },
  );
};
