import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { formatDateISOStringToCustom } from '@/localization/utils/formatDateISOStringToCustom';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { FieldDateMetadataSettings } from '@/object-record/record-field/types/FieldMetadata';

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
    case 'RELATIVE':
      return formatDateISOStringToRelativeDate(value);
    case 'USER_SETTINGS':
      return formatDateISOStringToDateTime(
        value,
        timeZone,
        dateFormat,
        timeFormat,
      );
    case 'CUSTOM':
      return formatDateISOStringToCustom(
        value,
        timeZone,
        dateFieldSettings.customISODateFormatString
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
