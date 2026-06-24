import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isDate, isNull, isString } from '@sniptt/guards';
import { isValid, parse } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import {
  isDefined,
  parseToInstantOrThrow,
  turnJSDateToPlainDate,
} from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const NON_ISO_DATE_FORMATS = [
  'yyyy.MM.dd',
  'yyyy/MM/dd',
  'MM-dd-yyyy',
  'MM/dd/yyyy',
  'MM.dd.yyyy',
  'MMMM d, yyyy',
  'MMM d, yyyy',
  'd MMMM yyyy',
  'd MMM yyyy',
  'dd-MMM-yyyy',
  'yyyy-MMM-dd',
];

const parseNonIsoDateToInstantString = (value: string): string | null => {
  for (const format of NON_ISO_DATE_FORMATS) {
    const parsed = parse(value, format, new Date());

    if (isValid(parsed)) {
      return turnJSDateToPlainDate(parsed)
        .toZonedDateTime('UTC')
        .toInstant()
        .toString();
    }
  }

  return null;
};

const normalizeDateTimeStringToInstantString = (
  value: string,
): string | null => {
  try {
    return parseToInstantOrThrow(value).toString();
  } catch {
    return parseNonIsoDateToInstantString(value);
  }
};

export const validateDateTimeFieldOrThrow = (
  value: unknown,
  fieldName: string,
): unknown => {
  if (isNull(value)) return null;

  if (isDate(value) && isValid(value)) {
    return Temporal.Instant.fromEpochMilliseconds(value.getTime()).toString();
  }

  if (isString(value)) {
    const normalizedValue = normalizeDateTimeStringToInstantString(value);

    if (isDefined(normalizedValue)) {
      return normalizedValue;
    }
  }

  const inspectedValue = inspect(value);

  throw new CommonQueryRunnerException(
    `Invalid value ${inspectedValue} for date-time field "${fieldName}". Expected format: 'YYYY-MM-DDTHH:mm:ssZ'`,
    CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    {
      userFriendlyMessage: msg`Invalid value for date-time: "${inspectedValue}". Expected format: 'YYYY-MM-DDTHH:mm:ssZ'`,
    },
  );
};
