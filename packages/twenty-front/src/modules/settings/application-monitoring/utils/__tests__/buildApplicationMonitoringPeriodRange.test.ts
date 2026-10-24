import { buildApplicationMonitoringPeriodRange } from '@/settings/application-monitoring/utils/buildApplicationMonitoringPeriodRange';

describe('buildApplicationMonitoringPeriodRange', () => {
  it('should end now and start the period length before', () => {
    expect(
      buildApplicationMonitoringPeriodRange({
        period: '24h',
        now: new Date('2026-10-19T08:00:00.000Z'),
      }),
    ).toEqual({
      period: '24h',
      periodStart: '2026-10-18T08:00:00.000Z',
      periodEnd: '2026-10-19T08:00:00.000Z',
    });
  });
});
