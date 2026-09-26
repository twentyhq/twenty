import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { type Temporal } from 'temporal-polyfill';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';
import { getCalendarMonthGridDays } from '~/utils/dates/getCalendarMonthGridDays';

export const getRecordCalendarDaysRange = ({
  selectedDate,
  calendarLayout,
  weekStartsOnDayIndex,
  calendarSystem,
}: {
  selectedDate: Temporal.PlainDate;
  calendarLayout: ViewCalendarLayout;
  weekStartsOnDayIndex: number;
  calendarSystem: CalendarSystem;
}) => {
  if (calendarLayout === ViewCalendarLayout.MONTH) {
    const monthDays = getCalendarMonthGridDays({
      date: selectedDate,
      calendarSystem,
      weekStartsOnDayIndex,
    });

    return {
      firstDay: monthDays[0],
      lastDay: monthDays[monthDays.length - 1],
      days: Array.from({ length: monthDays.length / 7 }, (_, rowIndex) =>
        monthDays.slice(rowIndex * 7, rowIndex * 7 + 7),
      ),
    };
  }

  if (calendarLayout === ViewCalendarLayout.DAY) {
    return {
      firstDay: selectedDate,
      lastDay: selectedDate,
      days: [[selectedDate]],
    };
  }

  const daysSinceStartOfWeek =
    ((selectedDate.dayOfWeek % 7) - weekStartsOnDayIndex + 7) % 7;
  const firstDay = selectedDate.subtract({ days: daysSinceStartOfWeek });
  const weekDays = Array.from({ length: 7 }, (_, dayIndex) =>
    firstDay.add({ days: dayIndex }),
  );

  return {
    firstDay,
    lastDay: weekDays[6],
    days: [weekDays],
  };
};
