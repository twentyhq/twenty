import { DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import {
  FieldDateDisplayFormat,
  FieldDateMetadataSettings,
} from '@/object-record/record-field/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

export const formatDateString = ({
  value,
  timeZone,
  dateFormat,
  dateFieldSettings,
  locale,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  value?: string | null;
  dateFieldSettings?: FieldDateMetadataSettings;
  locale?: Locale;
}): string => {
  if (!isDefined(value)) {
    return '';
  }

  switch (dateFieldSettings?.displayFormat) {
    case FieldDateDisplayFormat.RELATIVE:
      return formatDateISOStringToRelativeDate({
        isoDate: value,
        isDayMaximumPrecision: true,
        locale,
      });
    case FieldDateDisplayFormat.USER_SETTINGS:
      return formatDateISOStringToDate({
        date: value,
        timeZone,
        dateFormat,
        locale,
      });
    case FieldDateDisplayFormat.CUSTOM:
      return formatDateISOStringToCustomUnicodeFormat(
        value,
        timeZone,
        dateFieldSettings.customUnicodeDateFormat,
      );
    default:
      return formatDateISOStringToDate({
        date: value,
        timeZone,
        dateFormat,
        locale,
      });
  }
};
