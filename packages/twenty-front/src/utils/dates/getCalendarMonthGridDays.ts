import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { type Temporal } from 'temporal-polyfill';

export const getCalendarMonthGridDays = ({
  date,
  calendarSystem,
  weekStartsOnDayIndex,
}: {
  date: Temporal.PlainDate;
  calendarSystem: CalendarSystem;
  weekStartsOnDayIndex: number;
}): Temporal.PlainDate[] => {
  const firstDayOfMonth = date.withCalendar(calendarSystem).with({ day: 1 });

  const leadingDayCount =
    ((firstDayOfMonth.dayOfWeek % 7) - weekStartsOnDayIndex + 7) % 7;
  const weekCount = Math.ceil(
    (leadingDayCount + firstDayOfMonth.daysInMonth) / 7,
  );
  const firstGridDay = firstDayOfMonth
    .subtract({ days: leadingDayCount })
    .withCalendar('iso8601');

  return Array.from({ length: weekCount * 7 }, (_, index) =>
    firstGridDay.add({ days: index }),
  );
};
