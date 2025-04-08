import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToCustomUnicode35Format = (
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
