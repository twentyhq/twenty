import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToDate = (
  date: string,
  timeZone: string,
): string => {
  return formatInTimeZone(new Date(date), timeZone, 'MMMM d');
};
