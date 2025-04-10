import { DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToCustomUnicode35Format } from '@/localization/utils/formatDateISOStringToCustomUnicode35Format';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { FieldDateDisplayFormat, FieldDateMetadataSettings } from '@/object-record/record-field/types/FieldMetadata';

export const formatDateString = ({
  value,
  timeZone,
  dateFormat,
  dateFieldSettings,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  value?: string | null;
  dateFieldSettings?: FieldDateMetadataSettings;
}): string => {
  if (!value) {
    return '';
  }

  switch (dateFieldSettings?.displayFormat) {
    case FieldDateDisplayFormat.RELATIVE:
      return formatDateISOStringToRelativeDate(value);
    case FieldDateDisplayFormat.USER_SETTINGS:
      return formatDateISOStringToDate(value, timeZone, dateFormat);
    case FieldDateDisplayFormat.CUSTOM:
      return formatDateISOStringToCustomUnicode35Format(
        value,
        timeZone,
        dateFieldSettings.customUnicode35DateFormat,
      );
    default:
      return formatDateISOStringToDate(value, timeZone, dateFormat);
  }
};
