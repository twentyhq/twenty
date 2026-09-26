import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { localizeDateFormatToCalendarSystem } from '@/localization/utils/localizeDateFormatToCalendarSystem';
import { format, type Locale } from 'date-fns';
import { Temporal } from 'temporal-polyfill';

export const formatPlainDateISOString = ({
  date,
  dateFormat,
  calendarSystem,
  localeCatalog,
}: {
  date: string;
  dateFormat: string;
  calendarSystem: CalendarSystem;
  localeCatalog?: Locale;
}) => {
  const plainDate = Temporal.PlainDate.from(date);

  return format(
    new Date(plainDate.year, plainDate.month - 1, plainDate.day),
    localizeDateFormatToCalendarSystem({
      dateFormat,
      plainDate,
      calendarSystem,
      localeCode: localeCatalog?.code,
    }),
    { locale: localeCatalog },
  );
};
