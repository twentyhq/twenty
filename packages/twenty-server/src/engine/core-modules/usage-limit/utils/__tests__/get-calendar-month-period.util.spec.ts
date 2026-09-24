import { getCalendarMonthPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-month-period.util';

describe('getCalendarMonthPeriod', () => {
  it('returns the enclosing UTC calendar month', () => {
    const { periodStart, periodEnd } = getCalendarMonthPeriod(
      new Date('2026-08-27T15:30:00.000Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });

  it('rolls the end over a year boundary', () => {
    const { periodStart, periodEnd } = getCalendarMonthPeriod(
      new Date('2026-12-31T23:59:59.999Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('keeps a first-instant date inside its own month', () => {
    const { periodStart, periodEnd } = getCalendarMonthPeriod(
      new Date('2026-08-01T00:00:00.000Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });
});
