import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToCustomUnicodeFormat = (
  date: string,
  timeZone: string,
  dateFormat: string,
) => {
  try {
    return formatInTimeZone(new Date(date), timeZone, dateFormat);
  } catch (e) {
    return 'Invalid format string';
  }
};
