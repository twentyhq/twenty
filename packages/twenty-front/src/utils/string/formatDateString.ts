import { DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
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
}) => {
  if (!value) {
    return ''
  }

  switch (displayFormat) {
    case ('relative_date'):
      return formatDateISOStringToRelativeDate(value)
    default:
      return formatDateISOStringToDate(value, timeZone, dateFormat)
  }
};
