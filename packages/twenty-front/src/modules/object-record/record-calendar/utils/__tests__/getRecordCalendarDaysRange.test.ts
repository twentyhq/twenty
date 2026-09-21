import { getRecordCalendarDaysRange } from '@/object-record/record-calendar/utils/getRecordCalendarDaysRange';
import { Temporal } from 'temporal-polyfill';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

describe('getRecordCalendarDaysRange', () => {
  it.each([
    [ViewCalendarLayout.DAY, '2026-07-15', 1, '2026-07-15', '2026-07-15', 1],
    [ViewCalendarLayout.WEEK, '2026-07-15', 1, '2026-07-13', '2026-07-19', 1],
    [ViewCalendarLayout.WEEK, '2026-01-01', 0, '2025-12-28', '2026-01-03', 1],
    [ViewCalendarLayout.MONTH, '2026-07-15', 1, '2026-06-29', '2026-08-02', 5],
    [ViewCalendarLayout.MONTH, '2026-08-15', 1, '2026-07-27', '2026-09-06', 6],
    [ViewCalendarLayout.MONTH, '2024-02-15', 0, '2024-01-28', '2024-03-02', 5],
    [ViewCalendarLayout.MONTH, '2026-02-15', 0, '2026-02-01', '2026-02-28', 4],
  ])(
    '%s around %s with week start %s covers %s through %s in %s rows',
    (
      calendarLayout,
      selectedDate,
      weekStartsOnDayIndex,
      firstDay,
      lastDay,
      rowCount,
    ) => {
      const range = getRecordCalendarDaysRange({
        selectedDate: Temporal.PlainDate.from(selectedDate),
        calendarLayout,
        weekStartsOnDayIndex,
      });

      expect(range.firstDay.toString()).toBe(firstDay);
      expect(range.lastDay.toString()).toBe(lastDay);
      expect(range.days).toHaveLength(rowCount);
      const daysPerRow = calendarLayout === ViewCalendarLayout.DAY ? 1 : 7;
      expect(range.days.every((row) => row.length === daysPerRow)).toBe(true);
      expect(range.days.flat().map((day) => day.toString())).toEqual(
        Array.from({ length: rowCount * daysPerRow }, (_, index) =>
          Temporal.PlainDate.from(firstDay).add({ days: index }).toString(),
        ),
      );
    },
  );
});
