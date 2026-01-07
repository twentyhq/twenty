import { isDate, isNumber, isString } from '@sniptt/guards';
import {
  differenceInCalendarDays,
  differenceInDays,
  differenceInYears,
  format,
  formatDistance,
  formatDistanceToNow,
  isToday,
  isValid,
  parseISO,
  type Locale,
} from 'date-fns';

import { DateFormat } from '@/localization/constants/DateFormat';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { i18n } from '@lingui/core';
import { plural, t } from '@lingui/core/macro';
import { logError } from './logError';

// TODO: review all of this with Temporal
// - also break down this into small files
export const parseDate = (dateToParse: Date | string | number): Date => {
  if (dateToParse === 'now') return new Date();

  let formattedDate: Date | null = null;

  if (!dateToParse) {
    throw new CustomError(
      `Invalid date passed to formatPastDate: "${dateToParse}"`,
      'INVALID_DATE_FORMAT',
    );
  } else if (isString(dateToParse)) {
    formattedDate = parseISO(dateToParse);
  } else if (isDate(dateToParse)) {
    formattedDate = dateToParse;
  } else if (isNumber(dateToParse)) {
    formattedDate = new Date(dateToParse);
  }

  if (!formattedDate) {
    throw new CustomError(
      `Invalid date passed to formatPastDate: "${dateToParse}"`,
      'INVALID_DATE_FORMAT',
    );
  }

  if (!isValid(formattedDate)) {
    throw new CustomError(
      `Invalid date passed to formatPastDate: "${dateToParse}"`,
      'INVALID_DATE_FORMAT',
    );
  }

  return formattedDate;
};

export const formatDate = (
  dateToFormat: Date | string | number,
  formatString: string,
) => {
  try {
    const parsedDate = parseDate(dateToFormat);
    return format(parsedDate, formatString);
  } catch (error) {
    logError(error);
    return '';
  }
};

export const beautifyExactDateTime = (
  dateToBeautify: Date | string | number,
) => {
  const parsedDate = parseDate(dateToBeautify);
  const isTodayDate = isToday(parsedDate);
  const dateFormat = isTodayDate ? 'HH:mm' : 'MMM d, yyyy · HH:mm';
  return formatDate(dateToBeautify, dateFormat);
};

export const beautifyExactDate = (dateToBeautify: Date | string | number) => {
  const parsedDate = parseDate(dateToBeautify);
  const isTodayDate = isToday(parsedDate);
  if (isTodayDate) {
    return t`Today`;
  }
  return formatDate(dateToBeautify, 'MMM d, yyyy');
};

export const beautifyPastDateRelativeToNow = (
  pastDate: Date | string | number,
  locale?: Locale,
) => {
  try {
    const parsedDate = parseDate(pastDate);
    const now = new Date();
    const diffInSeconds = Math.abs(
      (now.getTime() - parsedDate.getTime()) / 1000,
    );

    // For very recent times (less than 30 seconds), show "now"
    if (diffInSeconds < 30) {
      return t`now`;
    }

    return formatDistanceToNow(parsedDate, {
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

    return differenceInCalendarDays(new Date(), parsedDate) >= 1;
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
  const fromDate = parseISO(date);
  const toDate = dateToCompareWith ? parseISO(dateToCompareWith) : new Date();

  const years = differenceInYears(fromDate, toDate);
  // Calculate remaining days after accounting for full years
  const startDateForDayCalculation = new Date(toDate);
  startDateForDayCalculation.setFullYear(
    startDateForDayCalculation.getFullYear() + years,
  );
  const days = differenceInDays(fromDate, startDateForDayCalculation);

  let result = '';

  if (years !== 0) {
    result = plural(Math.abs(years), {
      one: `${years} year`,
      other: `${years} years`,
    });

    if (short) return result;
  }

  if (years !== 0 && days !== 0) {
    result += ` ${t`and`} `;
  }

  if (days !== 0) {
    const daysPart = plural(Math.abs(days), {
      one: `${days} day`,
      other: `${days} days`,
    });
    result += daysPart;
  }

  return result;
};

export const formatToHumanReadableDate = (date: Date | string) => {
  const parsedJSDate = parseDate(date);

  return i18n.date(parsedJSDate, { dateStyle: 'medium' });
};

export const getDateTimeFormatStringFoDatePickerInputMask = (
  dateFormat: DateFormat,
): string => {
  switch (dateFormat) {
    case DateFormat.DAY_FIRST:
      return `dd/MM/yyyy HH:mm`;
    case DateFormat.YEAR_FIRST:
      return `yyyy-MM-dd HH:mm`;
    case DateFormat.MONTH_FIRST:
    default:
      return `MM/dd/yyyy HH:mm`;
  }
};

export const getDateFormatStringForDatePickerInputMask = (
  dateFormat: DateFormat,
): string => {
  switch (dateFormat) {
    case DateFormat.DAY_FIRST:
      return `dd/MM/yyyy`;
    case DateFormat.YEAR_FIRST:
      return `yyyy-MM-dd`;
    case DateFormat.MONTH_FIRST:
    default:
      return `MM/dd/yyyy`;
  }
};
