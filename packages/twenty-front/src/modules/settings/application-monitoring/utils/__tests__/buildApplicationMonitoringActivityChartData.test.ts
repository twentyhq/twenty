import { buildApplicationMonitoringActivityChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringActivityChartData';

describe('buildApplicationMonitoringActivityChartData', () => {
  it('should label daily buckets by day and fill the buckets without activity', () => {
    expect(
      buildApplicationMonitoringActivityChartData({
        periodStart: '2026-10-16T08:00:00.000Z',
        periodEnd: '2026-10-19T08:00:00.000Z',
        bucketSizeInSeconds: 24 * 60 * 60,
        activity: [
          {
            bucketStart: '2026-10-17T00:00:00.000Z',
            errorCount: 41,
            warningCount: 33,
            infoCount: 1100,
          },
        ],
      }),
    ).toEqual([
      { bucket: 'Oct 16', errorCount: 0, warningCount: 0 },
      { bucket: 'Oct 17', errorCount: 41, warningCount: 33 },
      { bucket: 'Oct 18', errorCount: 0, warningCount: 0 },
      { bucket: 'Oct 19', errorCount: 0, warningCount: 0 },
    ]);
  });

  it('should give every hourly bucket of a 24 hour period its own label', () => {
    const chartData = buildApplicationMonitoringActivityChartData({
      periodStart: '2026-10-19T13:42:00.000Z',
      periodEnd: '2026-10-20T13:42:00.000Z',
      bucketSizeInSeconds: 60 * 60,
      activity: [],
    });

    expect(chartData).toHaveLength(25);
    expect(new Set(chartData.map(({ bucket }) => bucket)).size).toBe(25);
  });
});
