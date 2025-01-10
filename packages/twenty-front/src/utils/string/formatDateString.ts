import { DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';

export const formatDateString = ({
  value,
  timeZone,
  dateFormat,
  displayAsRelativeDate,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  value?: string | null;
  displayAsRelativeDate?: boolean;
}) => {
  const formattedDate = value
    ? displayAsRelativeDate
      ? formatDateISOStringToRelativeDate(value)
      : formatDateISOStringToDate(value, timeZone, dateFormat)
    : '';

  return formattedDate;
};
