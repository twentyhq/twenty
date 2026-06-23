import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isDate, isNull, isString } from '@sniptt/guards';
import { isValid, parse } from 'date-fns';
import { Temporal } from 'temporal-polyfill';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const ACCEPTED_DATE_TIME_FORMATS = [
  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
  "yyyy-MM-dd'T'HH:mm:ssX",
  "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  "yyyy-MM-dd'T'HH:mm:ssxxx",
  "yyyy-MM-dd'T'HH:mm:ss.SSS",
  "yyyy-MM-dd'T'HH:mm:ss",
  'yyyy-MM-dd HH:mm:ss.SSS',
  'yyyy-MM-dd HH:mm:ss',
  'yyyy-MM-dd HH:mm',
  'yyyy-MM-dd',
  'yyyyMMdd',
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

// Normalize any accepted date-time input to a canonical ISO 8601 instant.
// Lenient input is intentional, but the stored value must be a full instant so
// downstream consumers (DB, mutation response, timeline events, frontend) never
// receive a date-only string for a DATE_TIME field.
const normalizeToInstantStringOrNull = (value: string): string | null => {
  // Strict ISO 8601 carrying an offset/Z is an exact instant: keep it as-is,
  // independent of the server time zone.
  try {
    return Temporal.Instant.from(value).toString();
  } catch {
    // Not a strict instant (zoneless, date-only, or alternative format below).
  }

  for (const format of ACCEPTED_DATE_TIME_FORMATS) {
    const parsed = parse(value, format, new Date());

    if (isValid(parsed)) {
      // These formats carry no offset; interpret the parsed wall-clock fields as
      // UTC so a date-only value becomes midnight UTC, deterministically.
      return Temporal.PlainDateTime.from({
        year: parsed.getFullYear(),
        month: parsed.getMonth() + 1,
        day: parsed.getDate(),
        hour: parsed.getHours(),
        minute: parsed.getMinutes(),
        second: parsed.getSeconds(),
        millisecond: parsed.getMilliseconds(),
      })
        .toZonedDateTime('UTC')
        .toInstant()
        .toString();
    }
  }

  return null;
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
    const normalizedValue = normalizeToInstantStringOrNull(value);

    if (isString(normalizedValue)) {
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
