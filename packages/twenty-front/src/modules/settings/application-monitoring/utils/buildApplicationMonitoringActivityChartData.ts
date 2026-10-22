import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';

export const buildApplicationMonitoringActivityChartData = (
  monitoring: Pick<
    ApplicationMonitoringData,
    'activity' | 'bucketSizeInSeconds' | 'periodStart' | 'periodEnd'
  >,
): ApplicationMonitoringChartDatum<
  'errorCount' | 'rateLimitedRequestCount' | 'rateLimitedJobCount'
>[] => {
  const activityByBucketStart = new Map(
    monitoring.activity.map((bucket) => [
      new Date(bucket.bucketStart).toISOString(),
      bucket,
    ]),
  );

  return listApplicationMonitoringBucketStarts(monitoring).map(
    (bucketStart) => {
      const bucket = activityByBucketStart.get(bucketStart);

      return {
        bucketStart,
        errorCount: bucket?.errorCount ?? 0,
        rateLimitedRequestCount: bucket?.rateLimitedRequestCount ?? 0,
        rateLimitedJobCount: bucket?.rateLimitedJobCount ?? 0,
      };
    },
  );
};
