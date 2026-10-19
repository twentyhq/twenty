import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { formatApplicationMonitoringBucketLabel } from '@/settings/application-monitoring/utils/formatApplicationMonitoringBucketLabel';
import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';

export const buildApplicationMonitoringLifecycleChartData = (
  monitoring: Pick<
    ApplicationMonitoringData,
    'lifecycle' | 'bucketSizeInSeconds' | 'periodStart' | 'periodEnd'
  >,
): BarChartDatum[] => {
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
        bucket: formatApplicationMonitoringBucketLabel({
          bucketStart,
          bucketSizeInSeconds: monitoring.bucketSizeInSeconds,
        }),
        failedCount: bucket?.failedCount ?? 0,
        installCount: bucket?.installCount ?? 0,
        upgradeCount: bucket?.upgradeCount ?? 0,
        uninstallCount: bucket?.uninstallCount ?? 0,
      };
    },
  );
};
