import { parseDate } from '~/utils/date-utils';

export const formatToHumanReadableMonth = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    timeZone: timeZone,
  }).format(parsedJSDate);
};

export const formatToHumanReadableDay = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    timeZone: timeZone,
  }).format(parsedJSDate);
};

export const formatToHumanReadableTime = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timeZone,
  }).format(parsedJSDate);
};

export const formatToHumanReadableMonthDateTime = (
  date: Date | string,
  timeZone: string,
) => {
  const formattedMonth = formatToHumanReadableMonth(date, timeZone);
  const formattedDay = formatToHumanReadableDay(date, timeZone);
  const formattedTime = formatToHumanReadableTime(date, timeZone);
  return `${formattedMonth} ${formattedDay} · ${formattedTime}`;
};
