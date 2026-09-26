import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { type DateFormat } from '@/localization/constants/DateFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import {
  FieldDateDisplayFormat,
  type FieldDateMetadataSettings,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { type Locale } from 'date-fns';

export const formatDateTimeString = ({
  value,
  timeZone,
  dateFormat,
  timeFormat,
  dateFieldSettings,
  calendarSystem,
  localeCatalog,
}: {
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  value?: string | null;
  dateFieldSettings?: FieldDateMetadataSettings;
  calendarSystem: CalendarSystem;
  localeCatalog: Locale;
}) => {
  if (!value) {
    return '';
  }

  switch (dateFieldSettings?.displayFormat) {
    case FieldDateDisplayFormat.RELATIVE:
      return formatDateISOStringToRelativeDate({
        isoDate: value,
        localeCatalog,
        timeZone,
      });
    case FieldDateDisplayFormat.USER_SETTINGS:
      return formatDateISOStringToDateTime({
        date: value,
        timeZone,
        dateFormat,
        timeFormat,
        calendarSystem,
        localeCatalog,
      });
    case FieldDateDisplayFormat.CUSTOM:
      return formatDateISOStringToCustomUnicodeFormat({
        date: value,
        timeZone,
        dateFormat: dateFieldSettings.customUnicodeDateFormat,
        calendarSystem,
        localeCatalog,
      });
    default:
      return formatDateISOStringToDateTime({
        date: value,
        timeZone,
        dateFormat,
        timeFormat,
        calendarSystem,
        localeCatalog,
      });
  }
};
