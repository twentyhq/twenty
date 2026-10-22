import { buildApplicationMonitoringCreditChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringCreditChartData';

describe('buildApplicationMonitoringCreditChartData', () => {
  it('should place credits in their bucket and fill the buckets without usage', () => {
    expect(
      buildApplicationMonitoringCreditChartData({
        periodStart: '2026-10-16T08:00:00.000Z',
        periodEnd: '2026-10-19T08:00:00.000Z',
        bucketSizeInSeconds: 24 * 60 * 60,
        creditUsage: [
          { bucketStart: '2026-10-17T00:00:00.000Z', creditsUsed: 12.5 },
        ],
      }),
    ).toEqual([
      { bucketStart: '2026-10-16T00:00:00.000Z', creditsUsed: 0 },
      { bucketStart: '2026-10-17T00:00:00.000Z', creditsUsed: 12.5 },
      { bucketStart: '2026-10-18T00:00:00.000Z', creditsUsed: 0 },
      { bucketStart: '2026-10-19T00:00:00.000Z', creditsUsed: 0 },
    ]);
  });
});
