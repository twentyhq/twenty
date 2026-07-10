import { isRecordCalendarDayInDateTimeRange } from '@/object-record/record-calendar/utils/isRecordCalendarDayInDateTimeRange';
import { Temporal } from 'temporal-polyfill';

const timeZone = 'Europe/Paris';

describe('isRecordCalendarDayInDateTimeRange', () => {
  it.each([
    ['2026-07-07', false],
    ['2026-07-08', true],
    ['2026-07-09', true],
    ['2026-07-10', true],
    ['2026-07-11', false],
  ])('matches the overlapping days of a multi-day event: %s', (day, result) => {
    expect(
      isRecordCalendarDayInDateTimeRange({
        day: Temporal.PlainDate.from(day),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-10T18:59:00Z',
        timeZone,
      }),
    ).toBe(result);
  });

  it('does not include the next day when an event ends exactly at midnight', () => {
    expect(
      isRecordCalendarDayInDateTimeRange({
        day: Temporal.PlainDate.from('2026-07-10'),
        startDateTime: '2026-07-08T15:59:00Z',
        endDateTime: '2026-07-09T22:00:00Z',
        timeZone,
      }),
    ).toBe(false);
  });

  it('uses the one-hour fallback when the end is unusable', () => {
    expect(
      isRecordCalendarDayInDateTimeRange({
        day: Temporal.PlainDate.from('2026-07-09'),
        startDateTime: '2026-07-08T21:30:00Z',
        endDateTime: 'not-a-date',
        timeZone,
      }),
    ).toBe(true);
  });

  it('returns false when the start is unusable', () => {
    expect(
      isRecordCalendarDayInDateTimeRange({
        day: Temporal.PlainDate.from('2026-07-08'),
        startDateTime: 'not-a-date',
        timeZone,
      }),
    ).toBe(false);
  });
});
