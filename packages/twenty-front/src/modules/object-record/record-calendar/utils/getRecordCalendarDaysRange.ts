import { getPlainDateStartOfWeek } from '@/localization/utils/getPlainDateStartOfWeek';
import { type Temporal } from 'temporal-polyfill';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const getRecordCalendarDaysRange = ({
  selectedDate,
  calendarLayout,
  weekStartsOnDayIndex,
}: {
  selectedDate: Temporal.PlainDate;
  calendarLayout: ViewCalendarLayout;
  weekStartsOnDayIndex: number;
}) => {
  const isDayLayout = calendarLayout === ViewCalendarLayout.DAY;
  const isMonthLayout = calendarLayout === ViewCalendarLayout.MONTH;
  const periodStart = isMonthLayout
    ? selectedDate.with({ day: 1 })
    : selectedDate;
  const startOfFirstWeek = getPlainDateStartOfWeek({
    day: periodStart,
    weekStartsOnDayIndex,
  });
  const daysSinceStartOfWeek = startOfFirstWeek.until(periodStart).days;
  const firstDay = isDayLayout ? selectedDate : startOfFirstWeek;
  const daysPerRow = isDayLayout ? 1 : 7;
  const rowCount = isMonthLayout
    ? Math.ceil((daysSinceStartOfWeek + selectedDate.daysInMonth) / 7)
    : 1;
  const days = Array.from({ length: rowCount }, (_, rowIndex) =>
    Array.from({ length: daysPerRow }, (_, dayIndex) =>
      firstDay.add({ days: rowIndex * daysPerRow + dayIndex }),
    ),
  );

  return {
    firstDay,
    lastDay: firstDay.add({ days: rowCount * daysPerRow - 1 }),
    days,
  };
};
