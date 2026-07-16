import { isRecordCalendarDayInDateRange } from '@/object-record/record-calendar/utils/isRecordCalendarDayInDateRange';
import { Temporal } from 'temporal-polyfill';

describe('isRecordCalendarDayInDateRange', () => {
  const startDate = Temporal.PlainDate.from('2026-07-06');
  const endDate = Temporal.PlainDate.from('2026-07-08');

  it.each([
    ['2026-07-05', false],
    ['2026-07-06', true],
    ['2026-07-07', true],
    ['2026-07-08', true],
    ['2026-07-09', false],
  ])('checks whether %s is inside the inclusive range', (day, expected) => {
    expect(
      isRecordCalendarDayInDateRange({
        day: Temporal.PlainDate.from(day),
        startDate,
        endDate,
      }),
    ).toBe(expected);
  });

  it.each([undefined, null, Temporal.PlainDate.from('2026-07-05')])(
    'falls back to the start day for an unusable end date',
    (unusableEndDate) => {
      expect(
        isRecordCalendarDayInDateRange({
          day: startDate,
          startDate,
          endDate: unusableEndDate,
        }),
      ).toBe(true);
      expect(
        isRecordCalendarDayInDateRange({
          day: startDate.add({ days: 1 }),
          startDate,
          endDate: unusableEndDate,
        }),
      ).toBe(false);
    },
  );
});
