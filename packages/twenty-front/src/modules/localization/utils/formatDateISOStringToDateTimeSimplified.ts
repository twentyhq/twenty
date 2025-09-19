import { DATE_FORMAT_WITHOUT_YEAR } from '@/localization/constants/DateFormatWithoutYear';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDateISOStringToDateTimeSimplified = (
  date: Date,
  timeZone: string,
  timeFormat: TimeFormat,
) => {
  const simplifiedDateFormat = DATE_FORMAT_WITHOUT_YEAR[detectDateFormat()];

  return formatInTimeZone(
    date,
    timeZone,
    `${simplifiedDateFormat} · ${timeFormat}`,
  );
};
