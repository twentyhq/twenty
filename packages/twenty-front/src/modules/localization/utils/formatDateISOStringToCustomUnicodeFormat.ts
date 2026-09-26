import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { formatInstantInTimeZone } from '@/localization/utils/formatInstantInTimeZone';
import { formatPlainDateISOString } from '@/localization/utils/formatPlainDateISOString';
import { type Locale } from 'date-fns';
import { isDateWithoutTime } from 'twenty-shared/utils';

export const formatDateISOStringToCustomUnicodeFormat = ({
  date,
  timeZone,
  dateFormat,
  calendarSystem,
  localeCatalog,
}: {
  date: string;
  timeZone: string;
  dateFormat: string;
  calendarSystem: CalendarSystem;
  localeCatalog: Locale;
}) => {
  try {
    if (isDateWithoutTime(date)) {
      return formatPlainDateISOString({
        date,
        dateFormat,
        calendarSystem,
        localeCatalog,
      });
    }

    return formatInstantInTimeZone({
      date: new Date(date),
      timeZone,
      dateFormat,
      calendarSystem,
      localeCatalog,
    });
  } catch {
    return 'Invalid format string';
  }
};
