import { resolveApplicationMonitoringPeriod } from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';

const NOW = new Date('2026-10-19T08:00:00.000Z');
const HOUR_IN_MS = 60 * 60 * 1000;

describe('resolveApplicationMonitoringPeriod', () => {
  it('defaults to the last 7 days in daily buckets', () => {
    expect(
      resolveApplicationMonitoringPeriod({
        lookbackInHours: 90 * 24,
        now: NOW,
      }),
    ).toEqual({
      periodStart: new Date(NOW.getTime() - 7 * 24 * HOUR_IN_MS),
      periodEnd: NOW,
      bucketSizeInSeconds: 24 * 60 * 60,
    });
  });

  it('caps the start at the lookback of a Pro plan and uses 5 minute buckets', () => {
    expect(
      resolveApplicationMonitoringPeriod({
        periodStart: new Date(NOW.getTime() - 24 * HOUR_IN_MS),
        lookbackInHours: 2,
        now: NOW,
      }),
    ).toEqual({
      periodStart: new Date(NOW.getTime() - 2 * HOUR_IN_MS),
      periodEnd: NOW,
      bucketSizeInSeconds: 5 * 60,
    });
  });

  it('uses hourly buckets for the last 24 hours', () => {
    expect(
      resolveApplicationMonitoringPeriod({
        periodStart: new Date(NOW.getTime() - 24 * HOUR_IN_MS),
        lookbackInHours: 90 * 24,
        now: NOW,
      }).bucketSizeInSeconds,
    ).toBe(60 * 60);
  });

  it('never ends in the future', () => {
    expect(
      resolveApplicationMonitoringPeriod({
        periodStart: new Date(NOW.getTime() - HOUR_IN_MS),
        periodEnd: new Date(NOW.getTime() + HOUR_IN_MS),
        lookbackInHours: 90 * 24,
        now: NOW,
      }).periodEnd,
    ).toEqual(NOW);
  });

  it('returns an empty period when the requested range is older than the lookback', () => {
    const period = resolveApplicationMonitoringPeriod({
      periodStart: new Date(NOW.getTime() - 48 * HOUR_IN_MS),
      periodEnd: new Date(NOW.getTime() - 24 * HOUR_IN_MS),
      lookbackInHours: 2,
      now: NOW,
    });

    expect(period.periodStart).toEqual(period.periodEnd);
    expect(period.periodEnd).toEqual(new Date(NOW.getTime() - 2 * HOUR_IN_MS));
  });
});
