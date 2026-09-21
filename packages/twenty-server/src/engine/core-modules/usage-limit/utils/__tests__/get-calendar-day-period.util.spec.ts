import { getCalendarDayPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-day-period.util';

describe('getCalendarDayPeriod', () => {
  it('returns the enclosing UTC day', () => {
    const { periodStart, periodEnd } = getCalendarDayPeriod(
      new Date('2026-08-27T15:30:00.000Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-27T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-08-28T00:00:00.000Z');
  });

  it('rolls the end over a month boundary', () => {
    const { periodStart, periodEnd } = getCalendarDayPeriod(
      new Date('2026-08-31T23:59:59.999Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-31T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });
});
