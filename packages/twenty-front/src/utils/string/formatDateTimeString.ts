import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';

export const formatDateTimeString = ({
  value,
  timeZone,
  dateFormat,
  timeFormat,
  displayAsRelativeDate,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  value?: string | null;
  displayAsRelativeDate?: boolean;
}) => {
  const formattedDate = value
    ? displayAsRelativeDate
      ? formatDateISOStringToRelativeDate(value)
      : formatDateISOStringToDateTime(value, timeZone, dateFormat, timeFormat)
    : '';

  return formattedDate;
};
