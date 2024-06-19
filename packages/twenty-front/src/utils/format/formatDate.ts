import { parseDate } from '~/utils/date-utils';

export const formatToHumanReadableMonth = (date: Date | string) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
  }).format(parsedJSDate);
};

export const formatToHumanReadableDay = (date: Date | string) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
  }).format(parsedJSDate);
};

export const formatToHumanReadableTime = (date: Date | string) => {
  const parsedJSDate = parseDate(date).toJSDate();

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric',
  }).format(parsedJSDate);
};
