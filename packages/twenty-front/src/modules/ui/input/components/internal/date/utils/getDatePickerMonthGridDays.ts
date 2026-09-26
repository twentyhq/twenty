import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { type Temporal } from 'temporal-polyfill';

export type DatePickerMonthGridDay = {
  plainDate: Temporal.PlainDate;
  dayOfMonth: number;
  isOutsideMonth: boolean;
};

export const getDatePickerMonthGridDays = ({
  visibleMonthDate,
  calendarSystem,
  firstDayOfTheWeekIsoNumber,
}: {
  visibleMonthDate: Temporal.PlainDate;
  calendarSystem: CalendarSystem;
  firstDayOfTheWeekIsoNumber: number;
}): DatePickerMonthGridDay[] => {
  const firstDayOfMonth = visibleMonthDate
    .withCalendar(calendarSystem)
    .with({ day: 1 });

  const leadingDayCount =
    (firstDayOfMonth.dayOfWeek - firstDayOfTheWeekIsoNumber + 7) % 7;
  const weekCount = Math.ceil(
    (leadingDayCount + firstDayOfMonth.daysInMonth) / 7,
  );
  const firstGridDay = firstDayOfMonth.subtract({ days: leadingDayCount });

  return Array.from({ length: weekCount * 7 }, (_, index) => {
    const calendarPlainDate = firstGridDay.add({ days: index });

    return {
      plainDate: calendarPlainDate.withCalendar('iso8601'),
      dayOfMonth: calendarPlainDate.day,
      isOutsideMonth: calendarPlainDate.monthCode !== firstDayOfMonth.monthCode,
    };
  });
};
