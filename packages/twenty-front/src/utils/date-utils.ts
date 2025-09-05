import { isDate, isNumber, isString } from '@sniptt/guards';
import {
  differenceInCalendarDays,
  formatDistance,
  formatDistanceToNow,
  type Locale,
} from 'date-fns';
import { DateTime } from 'luxon';

import { DateFormat } from '@/localization/constants/DateFormat';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { CustomError } from '@/error-handler/CustomError';
import { i18n } from '@lingui/core';
import { plural, t } from '@lingui/core/macro';
import { logError } from './logError';

const getLuxonLocale = () => {
  return SOURCE_LOCALE === 'en' ? 'en-US' : SOURCE_LOCALE;
};

export const parseDate = (dateToParse: Date | string | number) => {
  if (dateToParse === 'now') return DateTime.fromJSDate(new Date());

  let formattedDate: DateTime | null = null;

  if (!dateToParse) {
    throw new CustomError(
      `Invalid date passed to formatPastDate: "${dateToParse}"`,
      'INVALID_DATE_FORMAT',
    );
  } else if (isString(dateToParse)) {
    formattedDate = DateTime.fromISO(dateToParse);
  } else if (isDate(dateToParse)) {
    formattedDate = DateTime.fromJSDate(dateToParse);
  } else if (isNumber(dateToParse)) {
    formattedDate = DateTime.fromMillis(dateToParse);
  }

  if (!formattedDate) {
    throw new CustomError(
      `Invalid date passed to formatPastDate: "${dateToParse}"`,
      'INVALID_DATE_FORMAT',
    );
  }

  if (!formattedDate.isValid) {
    throw new CustomError(
      `Invalid date passed to formatPastDate: "${dateToParse}"`,
      'INVALID_DATE_FORMAT',
    );
  }

  return formattedDate.setLocale(getLuxonLocale());
};

const isSameDay = (a: DateTime, b: DateTime): boolean =>
  a.hasSame(b, 'day') && a.hasSame(b, 'month') && a.hasSame(b, 'year');

export const formatDate = (
  dateToFormat: Date | string | number,
  format: string,
) => {
  try {
    const parsedDate = parseDate(dateToFormat);
    return parsedDate.toFormat(format);
  } catch (error) {
    logError(error);
    return '';
  }
};

export const beautifyExactDateTime = (
  dateToBeautify: Date | string | number,
) => {
  const isToday = isSameDay(parseDate(dateToBeautify), DateTime.local());
  const dateFormat = isToday ? 'T' : 'DD · T';
  return formatDate(dateToBeautify, dateFormat);
};

export const beautifyExactDate = (dateToBeautify: Date | string | number) => {
  const isToday = isSameDay(parseDate(dateToBeautify), DateTime.local());
  if (isToday) {
    return t`Today`;
  }
  return formatDate(dateToBeautify, 'DD');
};

export const beautifyPastDateRelativeToNow = (
  pastDate: Date | string | number,
  locale?: Locale,
) => {
  try {
    const parsedDate = parseDate(pastDate);
    const now = new Date();
    const diffInSeconds = Math.abs(
      (now.getTime() - parsedDate.toJSDate().getTime()) / 1000,
    );

    // For very recent times (less than 30 seconds), show "now"
    if (diffInSeconds < 30) {
      return t`now`;
    }

    return formatDistanceToNow(parsedDate.toJSDate(), {
      addSuffix: true,
      locale,
      includeSeconds: true,
    });
  } catch (error) {
    logError(error);
    return '';
  }
};

export const hasDatePassed = (date: Date | string | number) => {
  try {
    const parsedDate = parseDate(date);

    return (
      differenceInCalendarDays(
        DateTime.local().toJSDate(),
        parsedDate.toJSDate(),
      ) >= 1
    );
  } catch (error) {
    logError(error);
    return false;
  }
};

export const beautifyDateDiff = (
  date: string,
  dateToCompareWith?: string,
  short = false,
  locale?: Locale,
) => {
  // For simple cases, use date-fns which has excellent locale support
  if (!short && isDefined(locale)) {
    const fromDate = new Date(date);
    const toDate = dateToCompareWith ? new Date(dateToCompareWith) : new Date();
    return formatDistance(fromDate, toDate, { locale });
  }

  // Manual implementation for complex cases or when locale is not available
  const dateDiff = DateTime.fromISO(date).diff(
    dateToCompareWith ? DateTime.fromISO(dateToCompareWith) : DateTime.now(),
    ['years', 'days'],
  );

  const years = Math.floor(dateDiff.years);
  const days = Math.floor(dateDiff.days);

  let result = '';

  if (years !== 0) {
    result = plural(Math.abs(years), {
      one: `${years} ${t`year`}`,
      other: `${years} ${t`years`}`,
    });

    if (short) return result;
  }

  if (years !== 0 && days !== 0) {
    result += ` ${t`and`} `;
  }

  if (days !== 0) {
    const daysPart = plural(Math.abs(days), {
      one: `${days} ${t`day`}`,
      other: `${days} ${t`days`}`,
    });
    result += daysPart;
  }

  return result;
};

export const formatToHumanReadableDate = (date: Date | string) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return i18n.date(parsedJSDate, { dateStyle: 'medium' });
};

export const getDateFormatString = (
  dateFormat: DateFormat,
  isDateTimeInput: boolean,
): string => {
  const timePart = isDateTimeInput ? ' HH:mm' : '';

  switch (dateFormat) {
    case DateFormat.DAY_FIRST:
      return `dd/MM/yyyy${timePart}`;
    case DateFormat.YEAR_FIRST:
      return `yyyy-MM-dd${timePart}`;
    case DateFormat.MONTH_FIRST:
    default:
      return `MM/dd/yyyy${timePart}`;
  }
};
