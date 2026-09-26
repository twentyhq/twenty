import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { localizeDateFormatToCalendarSystem } from '@/localization/utils/localizeDateFormatToCalendarSystem';
import { type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Temporal } from 'temporal-polyfill';

export const formatInstantInTimeZone = ({
  date,
  timeZone,
  dateFormat,
  calendarSystem,
  localeCatalog,
}: {
  date: Date;
  timeZone: string;
  dateFormat: string;
  calendarSystem: CalendarSystem;
  localeCatalog?: Locale;
}) => {
  const plainDateInTimeZone = Temporal.Instant.fromEpochMilliseconds(
    date.getTime(),
  )
    .toZonedDateTimeISO(timeZone)
    .toPlainDate();

  return formatInTimeZone(
    date,
    timeZone,
    localizeDateFormatToCalendarSystem({
      dateFormat,
      plainDate: plainDateInTimeZone,
      calendarSystem,
      localeCode: localeCatalog?.code,
    }),
    { locale: localeCatalog },
  );
};
