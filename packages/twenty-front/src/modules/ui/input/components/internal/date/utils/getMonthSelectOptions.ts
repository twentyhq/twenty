import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { Temporal } from 'temporal-polyfill';

export const getMonthSelectOptions = ({
  locale,
  calendarSystem,
  calendarYear,
}: {
  locale?: string;
  calendarSystem: CalendarSystem;
  calendarYear: number;
}): { label: string; value: number }[] => {
  const monthFormatter = new Intl.DateTimeFormat(locale || 'en-US', {
    month: 'long',
    calendar: calendarSystem,
    timeZone: 'UTC',
  });

  const firstDayOfYear = Temporal.PlainDate.from({
    calendar: calendarSystem,
    year: calendarYear,
    month: 1,
    day: 1,
  });

  return Array.from({ length: firstDayOfYear.monthsInYear }, (_, index) => {
    const firstDayOfMonth = firstDayOfYear.add({ months: index });

    return {
      label: monthFormatter.format(
        new Date(firstDayOfMonth.toZonedDateTime('UTC').epochMilliseconds),
      ),
      value: firstDayOfMonth.month,
    };
  });
};
