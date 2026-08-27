import { getCalendarMonthPeriod } from 'src/engine/core-modules/usage/utils/get-calendar-month-period.util';

describe('getCalendarMonthPeriod', () => {
  it('returns the first of the month to the first of the next month in UTC', () => {
    const { periodStart, periodEnd } = getCalendarMonthPeriod(
      new Date('2026-08-27T15:30:00.000Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });

  it('rolls over the year in December', () => {
    const { periodStart, periodEnd } = getCalendarMonthPeriod(
      new Date('2026-12-31T23:59:59.999Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('anchors on the UTC month when local time has crossed into the next one', () => {
    const { periodStart } = getCalendarMonthPeriod(
      new Date('2026-08-31T23:00:00.000Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });
});
