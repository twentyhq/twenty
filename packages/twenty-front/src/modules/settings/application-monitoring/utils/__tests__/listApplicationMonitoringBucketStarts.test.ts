import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';

describe('listApplicationMonitoringBucketStarts', () => {
  it('should list every bucket overlapping the period', () => {
    expect(
      listApplicationMonitoringBucketStarts({
        periodStart: '2026-10-19T06:12:00.000Z',
        periodEnd: '2026-10-19T08:12:00.000Z',
        bucketSizeInSeconds: 60 * 60,
      }),
    ).toEqual([
      '2026-10-19T06:00:00.000Z',
      '2026-10-19T07:00:00.000Z',
      '2026-10-19T08:00:00.000Z',
    ]);
  });
});
