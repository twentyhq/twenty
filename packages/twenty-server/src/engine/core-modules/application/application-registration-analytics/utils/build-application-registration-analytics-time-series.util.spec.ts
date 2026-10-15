import { buildApplicationRegistrationAnalyticsTimeSeries } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-time-series.util';

describe('buildApplicationRegistrationAnalyticsTimeSeries', () => {
  const periodStart = new Date('2026-10-01T00:00:00.000Z');
  const periodEnd = new Date('2026-10-04T00:00:00.000Z');

  it('should emit one zeroed point per day when there are no rows', () => {
    const points = buildApplicationRegistrationAnalyticsTimeSeries({
      rows: [],
      periodStart,
      periodEnd,
    });

    expect(points.map((point) => point.date)).toEqual([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
    expect(points[0].functionExecutions).toBe(0);
    expect(points[0].creditsCharged).toBe(0);
  });

  it('should pivot metrics into the matching day and leave other days at zero', () => {
    const points = buildApplicationRegistrationAnalyticsTimeSeries({
      rows: [
        { date: '2026-10-02', metric: 'install.succeeded', value: '3' },
        { date: '2026-10-02', metric: 'function.error', value: 1 },
        { date: '2026-10-03', metric: 'charge.credits_micro', value: 500000 },
      ],
      periodStart,
      periodEnd,
    });

    expect(points[0]).toMatchObject({
      date: '2026-10-01',
      installSucceeded: 0,
      functionErrors: 0,
    });
    expect(points[1]).toMatchObject({
      date: '2026-10-02',
      installSucceeded: 3,
      functionErrors: 1,
      creditsCharged: 0,
    });
    expect(points[2]).toMatchObject({
      date: '2026-10-03',
      creditsCharged: 0.5,
    });
  });

  it('should drop rows that fall outside the period', () => {
    const points = buildApplicationRegistrationAnalyticsTimeSeries({
      rows: [{ date: '2026-09-30', metric: 'install.succeeded', value: 9 }],
      periodStart,
      periodEnd,
    });

    expect(points.every((point) => point.installSucceeded === 0)).toBe(true);
  });

  it('should return nothing for an inverted period', () => {
    expect(
      buildApplicationRegistrationAnalyticsTimeSeries({
        rows: [],
        periodStart: periodEnd,
        periodEnd: periodStart,
      }),
    ).toEqual([]);
  });
});
