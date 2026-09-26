import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { localizeDateFormatToCalendarSystem } from '@/localization/utils/localizeDateFormatToCalendarSystem';
import { format, type Locale } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';

type FormatRecordCalendarWeekRangeArgs = {
  firstDayOfWeek: Temporal.PlainDate;
  lastDayOfWeek: Temporal.PlainDate;
  locale: Locale;
  calendarSystem: CalendarSystem;
};

export const formatRecordCalendarWeekRange = ({
  firstDayOfWeek,
  lastDayOfWeek,
  locale,
  calendarSystem,
}: FormatRecordCalendarWeekRangeArgs) => {
  const formatDay = (plainDate: Temporal.PlainDate, dateFormat: string) =>
    format(
      turnPlainDateToShiftedDateInSystemTimeZone(plainDate),
      localizeDateFormatToCalendarSystem({
        dateFormat,
        plainDate,
        calendarSystem,
        localeCode: locale.code,
      }),
      { locale },
    );

  const firstCalendarDay = firstDayOfWeek.withCalendar(calendarSystem);
  const lastCalendarDay = lastDayOfWeek.withCalendar(calendarSystem);

  if (firstCalendarDay.year !== lastCalendarDay.year) {
    return `${formatDay(firstDayOfWeek, 'MMM d, yyyy')} – ${formatDay(
      lastDayOfWeek,
      'MMM d, yyyy',
    )}`;
  }

  if (firstCalendarDay.month !== lastCalendarDay.month) {
    return `${formatDay(firstDayOfWeek, 'MMM d')} – ${formatDay(
      lastDayOfWeek,
      'MMM d, yyyy',
    )}`;
  }

  return `${formatDay(firstDayOfWeek, 'MMM d')} – ${formatDay(
    lastDayOfWeek,
    'd, yyyy',
  )}`;
};
