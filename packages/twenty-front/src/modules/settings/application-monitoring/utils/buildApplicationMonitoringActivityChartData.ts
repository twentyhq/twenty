import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { formatApplicationMonitoringBucketLabel } from '@/settings/application-monitoring/utils/formatApplicationMonitoringBucketLabel';
import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';

export const buildApplicationMonitoringActivityChartData = (
  monitoring: Pick<
    ApplicationMonitoringData,
    'activity' | 'bucketSizeInSeconds' | 'periodStart' | 'periodEnd'
  >,
): ApplicationMonitoringChartDatum<'errorCount' | 'warningCount'>[] => {
  const activityByBucketStart = new Map(
    monitoring.activity.map((bucket) => [
      new Date(bucket.bucketStart).toISOString(),
      bucket,
    ]),
  );

  return listApplicationMonitoringBucketStarts(monitoring).map(
    (bucketStart) => ({
      bucket: formatApplicationMonitoringBucketLabel({
        bucketStart,
        bucketSizeInSeconds: monitoring.bucketSizeInSeconds,
      }),
      errorCount: activityByBucketStart.get(bucketStart)?.errorCount ?? 0,
      warningCount: activityByBucketStart.get(bucketStart)?.warningCount ?? 0,
    }),
  );
};
