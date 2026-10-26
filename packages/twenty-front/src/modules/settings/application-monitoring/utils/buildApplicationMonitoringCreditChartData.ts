import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';

// Prefixed so an app-declared operation can never collide with bucketStart
type ApplicationMonitoringCreditSeriesKey = `operation:${string}`;

export const buildApplicationMonitoringCreditChartData = (
  monitoring: Pick<
    ApplicationMonitoringData,
    'bucketSizeInSeconds' | 'periodStart' | 'periodEnd'
  > & {
    creditUsage: NonNullable<ApplicationMonitoringData['creditUsage']>;
  },
): {
  series: {
    key: ApplicationMonitoringCreditSeriesKey;
    operationType: string;
  }[];
  data: ApplicationMonitoringChartDatum<ApplicationMonitoringCreditSeriesKey>[];
} => {
  const totalByOperationType = new Map<string, number>();
  const creditsUsedByBucketStartAndOperationType = new Map<string, number>();

  for (const bucket of monitoring.creditUsage) {
    totalByOperationType.set(
      bucket.operationType,
      (totalByOperationType.get(bucket.operationType) ?? 0) +
        bucket.creditsUsed,
    );
    creditsUsedByBucketStartAndOperationType.set(
      `${new Date(bucket.bucketStart).toISOString()}|${bucket.operationType}`,
      bucket.creditsUsed,
    );
  }

  const series = [...totalByOperationType.entries()]
    .sort(([, firstTotal], [, secondTotal]) => secondTotal - firstTotal)
    .map(([operationType]) => ({
      key: `operation:${operationType}` as const,
      operationType,
    }));

  return {
    series,
    data: listApplicationMonitoringBucketStarts(monitoring).map(
      (bucketStart) =>
        ({
          bucketStart,
          ...Object.fromEntries(
            series.map(({ key, operationType }) => [
              key,
              creditsUsedByBucketStartAndOperationType.get(
                `${bucketStart}|${operationType}`,
              ) ?? 0,
            ]),
          ),
        }) as ApplicationMonitoringChartDatum<ApplicationMonitoringCreditSeriesKey>,
    ),
  };
};
