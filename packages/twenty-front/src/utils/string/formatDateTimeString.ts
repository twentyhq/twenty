import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { FieldDateDisplayFormat } from '@/object-record/record-field/types/FieldMetadata';

export const formatDateTimeString = ({
  value,
  timeZone,
  dateFormat,
  timeFormat,
  displayFormat,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  value?: string | null;
  displayFormat?: FieldDateDisplayFormat;
}) => {
  if (!value) {
    return '';
  }

  switch (displayFormat) {
    case ('relative_date'):
      return formatDateISOStringToRelativeDate(value);
    default:
      return formatDateISOStringToDateTime(value, timeZone, dateFormat, timeFormat);
  }
};
