import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';

export const buildApplicationMonitoringLifecycleChartData = (
  monitoring: Pick<
    ApplicationMonitoringData,
    'lifecycle' | 'bucketSizeInSeconds' | 'periodStart' | 'periodEnd'
  >,
): ApplicationMonitoringChartDatum<
  'failedCount' | 'installCount' | 'upgradeCount' | 'uninstallCount'
>[] => {
  const lifecycleByBucketStart = new Map(
    monitoring.lifecycle.map((bucket) => [
      new Date(bucket.bucketStart).toISOString(),
      bucket,
    ]),
  );

  return listApplicationMonitoringBucketStarts(monitoring).map(
    (bucketStart) => {
      const bucket = lifecycleByBucketStart.get(bucketStart);

      return {
        bucketStart,
        failedCount: bucket?.failedCount ?? 0,
        installCount: bucket?.installCount ?? 0,
        upgradeCount: bucket?.upgradeCount ?? 0,
        uninstallCount: bucket?.uninstallCount ?? 0,
      };
    },
  );
};
