import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { formatDateISOStringToCustomUnicode35Format } from '@/localization/utils/formatDateISOStringToCustomUnicode35Format';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { FieldDateDisplayFormat, FieldDateMetadataSettings } from '@/object-record/record-field/types/FieldMetadata';

export const formatDateTimeString = ({
  value,
  timeZone,
  dateFormat,
  timeFormat,
  dateFieldSettings,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  value?: string | null;
  dateFieldSettings?: FieldDateMetadataSettings;
}) => {
  if (!value) {
    return '';
  }

  switch (dateFieldSettings?.displayFormat) {
    case FieldDateDisplayFormat.RELATIVE:
      return formatDateISOStringToRelativeDate(value);
    case FieldDateDisplayFormat.USER_SETTINGS:
      return formatDateISOStringToDateTime(
        value,
        timeZone,
        dateFormat,
        timeFormat,
      );
    case FieldDateDisplayFormat.CUSTOM:
      return formatDateISOStringToCustomUnicode35Format(
        value,
        timeZone,
        dateFieldSettings.customUnicode35DateFormat,
      );
    default:
      return formatDateISOStringToDateTime(
        value,
        timeZone,
        dateFormat,
        timeFormat,
      );
  }
};
