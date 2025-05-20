import { DateFormat } from '@/localization/constants/DateFormat';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToDate = ({
  date,
  timeZone,
  dateFormat,
  locale,
}: {
  date: string;
  timeZone: string;
  dateFormat: DateFormat;
  locale?: Locale;
}) => {
  return formatInTimeZone(new Date(date), timeZone, dateFormat, {
    locale,
  });
};
