import { inspect } from 'util';

import { isDate, isNull, isNumber, isString } from '@sniptt/guards';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

export const coerceDateAndDateTimeFieldOrThrow = (
  value: unknown,
  fieldName?: string,
) => {
  if (isNull(value)) return null;

  if (isString(value) || isNumber(value) || isDate(value)) {
    const date = new Date(value as string);

    if (!isNaN(date.getTime())) return value;
  }

  throw new CommonDataCoercerException(
    `Invalid value ${inspect(value)} for date or date-time field "${fieldName}"`,
    CommonDataCoercerExceptionCode.INVALID_DATE_OR_DATE_TIME,
  );
};
