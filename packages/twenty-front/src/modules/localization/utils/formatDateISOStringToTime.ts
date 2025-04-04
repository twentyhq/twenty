import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToTime = (date: string, timeZone: string): string => {
  return formatInTimeZone(new Date(date), timeZone, 'HH:mm:ss');
};
