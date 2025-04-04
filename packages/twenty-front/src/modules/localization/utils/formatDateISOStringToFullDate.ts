import { DateFormat } from '@/localization/constants/DateFormat';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToFullDate = (
  date: string,
  timeZone: string,
  dateFormat: DateFormat,
) => {
  return formatInTimeZone(new Date(date), timeZone, dateFormat);
};
