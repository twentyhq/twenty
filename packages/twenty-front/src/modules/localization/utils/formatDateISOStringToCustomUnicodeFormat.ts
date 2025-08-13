import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToCustomUnicodeFormat = ({
  date,
  timeZone,
  dateFormat,
  localeCatalog,
}: {
  date: string;
  timeZone: string;
  dateFormat: string;
  localeCatalog: Locale;
}) => {
  try {
    return formatInTimeZone(new Date(date), timeZone, dateFormat, {
      locale: localeCatalog,
    });
  } catch {
    return 'Invalid format string';
  }
};
