import { buildApplicationMonitoringActivityChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringActivityChartData';

describe('buildApplicationMonitoringActivityChartData', () => {
  it('should fill the buckets without activity', () => {
    expect(
      buildApplicationMonitoringActivityChartData({
        periodStart: '2026-10-16T08:00:00.000Z',
        periodEnd: '2026-10-19T08:00:00.000Z',
        bucketSizeInSeconds: 24 * 60 * 60,
        activity: [
          {
            bucketStart: '2026-10-17T00:00:00.000Z',
            errorCount: 41,
            rateLimitedRequestCount: 33,
            rateLimitedJobCount: 4,
          },
        ],
      }),
    ).toEqual([
      { errorCount: 0, rateLimitedRequestCount: 0, rateLimitedJobCount: 0 },
      { errorCount: 41, rateLimitedRequestCount: 33, rateLimitedJobCount: 4 },
      { errorCount: 0, rateLimitedRequestCount: 0, rateLimitedJobCount: 0 },
      { errorCount: 0, rateLimitedRequestCount: 0, rateLimitedJobCount: 0 },
    ]);
  });
});
