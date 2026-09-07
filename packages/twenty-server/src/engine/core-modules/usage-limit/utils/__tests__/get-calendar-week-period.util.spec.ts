import { getCalendarWeekPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-week-period.util';

describe('getCalendarWeekPeriod', () => {
  it('anchors to the enclosing Monday-started UTC week', () => {
    const { periodStart, periodEnd } = getCalendarWeekPeriod(
      new Date('2026-08-27T15:30:00.000Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-24T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-08-31T00:00:00.000Z');
  });

  it('keeps a Monday inside its own week', () => {
    const { periodStart } = getCalendarWeekPeriod(
      new Date('2026-08-24T00:00:00.000Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-24T00:00:00.000Z');
  });

  it('puts a Sunday at the end of the running week', () => {
    const { periodStart, periodEnd } = getCalendarWeekPeriod(
      new Date('2026-08-30T23:59:59.999Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-24T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-08-31T00:00:00.000Z');
  });

  it('rolls over a month boundary', () => {
    const { periodStart, periodEnd } = getCalendarWeekPeriod(
      new Date('2026-09-01T00:00:00.000Z'),
    );

    expect(periodStart.toISOString()).toBe('2026-08-31T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-09-07T00:00:00.000Z');
  });
});
