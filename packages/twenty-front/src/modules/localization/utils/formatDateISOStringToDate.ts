import { type DateFormat } from '@/localization/constants/DateFormat';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToDate = ({
  date,
  timeZone,
  dateFormat,
  localeCatalog,
}: {
  date: string;
  timeZone: string;
  dateFormat: DateFormat;
  localeCatalog?: Locale;
}) => {
  return formatInTimeZone(new Date(date), timeZone, dateFormat, {
    locale: localeCatalog,
  });
};
