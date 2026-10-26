import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';
import { type UsageOperationType } from '~/generated-metadata/graphql';

export const buildApplicationMonitoringCreditChartData = (
  monitoring: Pick<
    ApplicationMonitoringData,
    'bucketSizeInSeconds' | 'periodStart' | 'periodEnd'
  > & {
    creditUsage: NonNullable<ApplicationMonitoringData['creditUsage']>;
  },
): {
  operationTypes: UsageOperationType[];
  data: ApplicationMonitoringChartDatum<UsageOperationType>[];
} => {
  const totalByOperationType = new Map<UsageOperationType, number>();
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

  const operationTypes = [...totalByOperationType.entries()]
    .sort(([, firstTotal], [, secondTotal]) => secondTotal - firstTotal)
    .map(([operationType]) => operationType);

  return {
    operationTypes,
    data: listApplicationMonitoringBucketStarts(monitoring).map(
      (bucketStart) =>
        ({
          bucketStart,
          ...Object.fromEntries(
            operationTypes.map((operationType) => [
              operationType,
              creditsUsedByBucketStartAndOperationType.get(
                `${bucketStart}|${operationType}`,
              ) ?? 0,
            ]),
          ),
        }) as ApplicationMonitoringChartDatum<UsageOperationType>,
    ),
  };
};
