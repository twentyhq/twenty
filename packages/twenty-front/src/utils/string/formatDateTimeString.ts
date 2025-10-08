import { type DateFormat } from '@/localization/constants/DateFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { type Locale } from 'date-fns';
import {
  DateDisplayFormat,
  type FieldMetadataDateSettings,
} from 'twenty-shared/types';

export const formatDateTimeString = ({
  value,
  timeZone,
  dateFormat,
  timeFormat,
  dateFieldSettings,
  localeCatalog,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  value?: string | null;
  dateFieldSettings?: FieldMetadataDateSettings;
  localeCatalog: Locale;
}) => {
  if (!value) {
    return '';
  }

  switch (dateFieldSettings?.displayFormat) {
    case DateDisplayFormat.RELATIVE:
      return formatDateISOStringToRelativeDate({
        isoDate: value,
        localeCatalog: localeCatalog,
      });
    case DateDisplayFormat.USER_SETTINGS:
      return formatDateISOStringToDateTime({
        date: value,
        timeZone,
        dateFormat,
        timeFormat,
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
      return formatDateISOStringToDateTime({
        date: value,
        timeZone,
        dateFormat,
        timeFormat,
        localeCatalog,
      });
  }
};
