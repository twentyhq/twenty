import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToDateTimeSimplified = (
  date: Date,
  timeZone: string,
  dateFormat: DateFormat,
  timeFormat: TimeFormat,
) => {
  const simplifiedDateFormat = dateFormat
    .replace(/,/g, '')
    .split(' ')
    .filter((part) => part !== 'yyyy')
    .join(' ');
  return formatInTimeZone(
    date,
    timeZone,
    `${simplifiedDateFormat} · ${timeFormat}`,
  );
};
