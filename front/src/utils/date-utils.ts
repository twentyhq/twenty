import { formatDistanceToNow } from 'date-fns';
import { DateTime } from 'luxon';

import { logError } from './logError';

export const DEFAULT_DATE_LOCALE = 'en-EN';

export function parseDate(dateToParse: Date | string | number) {
  let formattedDate: DateTime | null = null;

  if (!dateToParse) {
    throw new Error(`Invalid date passed to formatPastDate: "${dateToParse}"`);
  } else if (typeof dateToParse === 'string') {
    formattedDate = DateTime.fromISO(dateToParse);
  } else if (dateToParse instanceof Date) {
    formattedDate = DateTime.fromJSDate(dateToParse);
  } else if (typeof dateToParse === 'number') {
    formattedDate = DateTime.fromMillis(dateToParse);
  }

  if (!formattedDate) {
    throw new Error(`Invalid date passed to formatPastDate: "${dateToParse}"`);
  }

  if (!formattedDate.isValid) {
    throw new Error(`Invalid date passed to formatPastDate: "${dateToParse}"`);
  }

  return formattedDate.setLocale(DEFAULT_DATE_LOCALE);
}

export function getWeekYear(dateToParse: Date | string | number) {
  const date =
    typeof dateToParse === 'number'
      ? new Date(dateToParse)
      : new Date(dateToParse);
  const weekNumber = getISOWeekNumber(date);
  const year = date.getFullYear();
  return [weekNumber, year];
}

// Helper function to get the ISO week number of a given date
function getISOWeekNumber(date: Date): number {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() + 4 - (date.getDay() || 7)); // Set to the Thursday of the current week
  const yearStart = new Date(startOfWeek.getFullYear(), 0, 1);
  const diffInDays = Math.floor(
    (startOfWeek.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil((diffInDays + 1) / 7);
}

export function beautifyExactDate(dateToBeautify: Date | string | number) {
  try {
    const parsedDate = parseDate(dateToBeautify);

    return parsedDate.toFormat('DD · T');
  } catch (error) {
    logError(error);
    return '';
  }
}

export function beautifyPastDateRelativeToNow(
  pastDate: Date | string | number,
) {
  try {
    const parsedDate = parseDate(pastDate);

    return formatDistanceToNow(parsedDate.toJSDate());
  } catch (error) {
    logError(error);
    return '';
  }
}

export function beautifyPastDateAbsolute(pastDate: Date | string | number) {
  try {
    const parsedPastDate = parseDate(pastDate);

    const hoursDiff = parsedPastDate.diffNow('hours').negate().hours;

    if (hoursDiff <= 24) {
      return parsedPastDate.toFormat('HH:mm');
    } else if (hoursDiff <= 7 * 24) {
      return parsedPastDate.toFormat('cccc - HH:mm');
    } else if (hoursDiff <= 365 * 24) {
      return parsedPastDate.toFormat('MMMM d - HH:mm');
    } else {
      return parsedPastDate.toFormat('dd/MM/yyyy - HH:mm');
    }
  } catch (error) {
    logError(error);
    return '';
  }
}
