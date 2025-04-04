import { DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToFullDate } from '@/localization/utils/formatDateISOStringToFullDate';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { formatDateISOStringToTime } from '@/localization/utils/formatDateISOStringToTime';
import { formatDateISOStringToYear } from '@/localization/utils/formatDateISOStringToYear';
import { FieldDateDisplayFormat } from '@/object-record/record-field/types/FieldMetadata';

export const formatDateString = ({
  value,
  timeZone,
  dateFormat,
  displayFormat,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  value?: string | null;
  displayFormat?: FieldDateDisplayFormat;
}): string => {
  if (!value) {
    return '';
  }

  switch (displayFormat) {
    case 'relative_date':
      return formatDateISOStringToRelativeDate(value);
    case 'year':
      return formatDateISOStringToYear(value);
    case 'time':
      return formatDateISOStringToTime(value, timeZone);
    case 'full_date':
      return formatDateISOStringToFullDate(value, timeZone, dateFormat);
    case 'date':
      return formatDateISOStringToDate(value, timeZone);
    default:
      return formatDateISOStringToFullDate(value, timeZone, dateFormat);
  }
};
