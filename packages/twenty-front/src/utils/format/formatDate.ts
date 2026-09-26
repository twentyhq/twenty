import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { parseDate } from '~/utils/date-utils';

export const formatToHumanReadableMonth = (
  date: Date | string,
  timeZone: string,
  calendarSystem: CalendarSystem,
) => {
  const parsedJSDate = parseDate(date);

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    timeZone: timeZone,
    calendar: calendarSystem,
  }).format(parsedJSDate);
};

export const formatToHumanReadableDay = (
  date: Date | string,
  timeZone: string,
  calendarSystem: CalendarSystem,
) => {
  const parsedJSDate = parseDate(date);

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    timeZone: timeZone,
    calendar: calendarSystem,
  }).format(parsedJSDate);
};

export const formatToHumanReadableTime = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date);

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timeZone,
  }).format(parsedJSDate);
};
