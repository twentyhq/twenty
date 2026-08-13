import { getRecordCalendarWeekEventDropShift } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventDropShift';
import { Temporal } from 'temporal-polyfill';

const timeZone = 'Europe/Paris';

describe('getRecordCalendarWeekEventDropShift', () => {
  it('computes the day offset and time-of-day delta', () => {
    expect(
      getRecordCalendarWeekEventDropShift({
        destinationDay: Temporal.PlainDate.from('2026-07-09'),
        destinationMinutes: 18 * 60 + 59,
        startDateTime: '2026-07-08T15:59:00Z',
        timeZone,
      }),
    ).toEqual({
      dayOffset: 1,
      timeOfDayDeltaNanoseconds: 3_600_000_000_000n,
    });
  });

  it('returns a zero delta for a same-time drop when the start day springs forward', () => {
    expect(
      getRecordCalendarWeekEventDropShift({
        destinationDay: Temporal.PlainDate.from('2026-03-30'),
        destinationMinutes: 10 * 60,
        startDateTime: '2026-03-29T08:00:00Z',
        timeZone,
      }),
    ).toEqual({
      dayOffset: 1,
      timeOfDayDeltaNanoseconds: 0n,
    });
  });

  it('returns a zero delta for a same-time drop when the start day falls back', () => {
    expect(
      getRecordCalendarWeekEventDropShift({
        destinationDay: Temporal.PlainDate.from('2026-10-26'),
        destinationMinutes: 10 * 60,
        startDateTime: '2026-10-25T09:00:00Z',
        timeZone,
      }),
    ).toEqual({
      dayOffset: 1,
      timeOfDayDeltaNanoseconds: 0n,
    });
  });

  it('returns null when the start is not a string', () => {
    expect(
      getRecordCalendarWeekEventDropShift({
        destinationDay: Temporal.PlainDate.from('2026-07-09'),
        destinationMinutes: 600,
        startDateTime: undefined,
        timeZone,
      }),
    ).toBeNull();
  });

  it('returns null when the start is malformed', () => {
    expect(
      getRecordCalendarWeekEventDropShift({
        destinationDay: Temporal.PlainDate.from('2026-07-09'),
        destinationMinutes: 600,
        startDateTime: 'not-a-date',
        timeZone,
      }),
    ).toBeNull();
  });
});
