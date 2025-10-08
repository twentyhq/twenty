import { type DateFormat } from '@/localization/constants/DateFormat';
import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import {
  DateDisplayFormat,
  type FieldMetadataDateSettings,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const formatDateString = ({
  value,
  timeZone,
  dateFormat,
  dateFieldSettings,
  localeCatalog,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  value?: string | null;
  dateFieldSettings?: FieldMetadataDateSettings;
  localeCatalog: Locale;
}): string => {
  if (!isDefined(value)) {
    return '';
  }

  switch (dateFieldSettings?.displayFormat) {
    case DateDisplayFormat.RELATIVE:
      return formatDateISOStringToRelativeDate({
        isoDate: value,
        isDayMaximumPrecision: true,
        localeCatalog,
      });
    case DateDisplayFormat.USER_SETTINGS:
      return formatDateISOStringToDate({
        date: value,
        timeZone,
        dateFormat,
        localeCatalog,
      });
    case DateDisplayFormat.CUSTOM:
      return formatDateISOStringToCustomUnicodeFormat({
        date: value,
        timeZone,
        dateFormat: dateFieldSettings.customUnicodeDateFormat,
        localeCatalog,
      });
    default:
      return formatDateISOStringToDate({
        date: value,
        timeZone,
        dateFormat,
        localeCatalog,
      });
  }
};
