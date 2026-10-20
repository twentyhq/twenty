import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';

export const buildApplicationMonitoringCreditChartData = (
  monitoring: Pick<
    ApplicationMonitoringData,
    'creditUsage' | 'bucketSizeInSeconds' | 'periodStart' | 'periodEnd'
  >,
): ApplicationMonitoringChartDatum<'creditsUsed'>[] => {
  const creditsUsedByBucketStart = new Map(
    monitoring.creditUsage.map((bucket) => [
      new Date(bucket.bucketStart).toISOString(),
      bucket.creditsUsed,
    ]),
  );

  return listApplicationMonitoringBucketStarts(monitoring).map(
    (bucketStart) => ({
      creditsUsed: creditsUsedByBucketStart.get(bucketStart) ?? 0,
    }),
  );
};
