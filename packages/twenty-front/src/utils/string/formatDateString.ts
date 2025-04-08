import { DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToCustom } from '@/localization/utils/formatDateISOStringToCustom';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { FieldDateMetadataSettings } from '@/object-record/record-field/types/FieldMetadata';

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
    case 'RELATIVE':
      return formatDateISOStringToRelativeDate(value);
    case 'USER_SETTINGS':
      return formatDateISOStringToDate(value, timeZone, dateFormat);
    case 'CUSTOM':
      return formatDateISOStringToCustom(
        value,
        timeZone,
        dateFieldSettings.customISODateFormatString,
      );
    default:
      return formatDateISOStringToDate(value, timeZone, dateFormat);
  }
};
