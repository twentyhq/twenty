import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { type DateFormat } from '@/localization/constants/DateFormat';
import { formatInstantInTimeZone } from '@/localization/utils/formatInstantInTimeZone';
import { formatPlainDateISOString } from '@/localization/utils/formatPlainDateISOString';
import { type Locale } from 'date-fns';
import { isDateWithoutTime } from 'twenty-shared/utils';

export const formatDateISOStringToDate = ({
  date,
  timeZone,
  dateFormat,
  calendarSystem,
  localeCatalog,
}: {
  date: string;
  timeZone: string;
  dateFormat: DateFormat;
  calendarSystem: CalendarSystem;
  localeCatalog?: Locale;
}) => {
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
};
