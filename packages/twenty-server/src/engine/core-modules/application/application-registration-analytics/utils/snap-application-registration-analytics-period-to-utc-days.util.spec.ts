import { snapApplicationRegistrationAnalyticsPeriodToUtcDays } from 'src/engine/core-modules/application/application-registration-analytics/utils/snap-application-registration-analytics-period-to-utc-days.util';

describe('snapApplicationRegistrationAnalyticsPeriodToUtcDays', () => {
  it('should widen an unaligned window to the enclosing whole days', () => {
    expect(
      snapApplicationRegistrationAnalyticsPeriodToUtcDays({
        periodStart: new Date('2026-10-01T13:45:12.345Z'),
        periodEnd: new Date('2026-10-02T00:00:00.001Z'),
      }),
    ).toEqual({
      periodStart: new Date('2026-10-01T00:00:00.000Z'),
      periodEnd: new Date('2026-10-03T00:00:00.000Z'),
    });
  });

  it('should leave day-aligned instants untouched', () => {
    const periodStart = new Date('2026-10-01T00:00:00.000Z');
    const periodEnd = new Date('2026-10-08T00:00:00.000Z');

    expect(
      snapApplicationRegistrationAnalyticsPeriodToUtcDays({
        periodStart,
        periodEnd,
      }),
    ).toEqual({ periodStart, periodEnd });
  });

  it('should never produce a window shorter than one day for distinct instants', () => {
    const { periodStart, periodEnd } =
      snapApplicationRegistrationAnalyticsPeriodToUtcDays({
        periodStart: new Date('2026-10-01T10:00:00.000Z'),
        periodEnd: new Date('2026-10-01T10:00:00.001Z'),
      });

    expect(periodEnd.getTime() - periodStart.getTime()).toBe(
      24 * 60 * 60 * 1000,
    );
  });
});
