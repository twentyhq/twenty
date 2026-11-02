import { isDefined } from 'twenty-shared/utils';

import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { listApplicationMonitoringBucketStarts } from '@/settings/application-monitoring/utils/listApplicationMonitoringBucketStarts';

// Prefixed so neither collides with bucketStart, nor a declared label with an operation type
type ApplicationMonitoringCreditSeriesKey =
  | `operation:${string}`
  | `label:${string}`;

type ApplicationMonitoringCreditSeries = {
  key: ApplicationMonitoringCreditSeriesKey;
  operationType: string;
  operationLabel: string | null;
};

export const buildApplicationMonitoringCreditChartData = (
  monitoring: Pick<
    ApplicationMonitoringData,
    'bucketSizeInSeconds' | 'periodStart' | 'periodEnd'
  > & {
    creditUsage: NonNullable<ApplicationMonitoringData['creditUsage']>;
  },
): {
  series: ApplicationMonitoringCreditSeries[];
  data: ApplicationMonitoringChartDatum<ApplicationMonitoringCreditSeriesKey>[];
} => {
  const seriesByKey = new Map<
    ApplicationMonitoringCreditSeriesKey,
    ApplicationMonitoringCreditSeries & { total: number }
  >();
  const creditsUsedByBucketStartAndSeriesKey = new Map<string, number>();

  for (const bucket of monitoring.creditUsage) {
    const operationLabel = bucket.operationLabel ?? null;
    const key: ApplicationMonitoringCreditSeriesKey = isDefined(operationLabel)
      ? `label:${operationLabel}`
      : `operation:${bucket.operationType}`;
    const series = seriesByKey.get(key);

    if (isDefined(series)) {
      series.total += bucket.creditsUsed;
    } else {
      seriesByKey.set(key, {
        key,
        operationType: bucket.operationType,
        operationLabel,
        total: bucket.creditsUsed,
      });
    }

    const bucketKey = `${new Date(bucket.bucketStart).toISOString()}|${key}`;

    creditsUsedByBucketStartAndSeriesKey.set(
      bucketKey,
      (creditsUsedByBucketStartAndSeriesKey.get(bucketKey) ?? 0) +
        bucket.creditsUsed,
    );
  }

  const series = [...seriesByKey.values()]
    .sort((firstSeries, secondSeries) => secondSeries.total - firstSeries.total)
    .map(({ key, operationType, operationLabel }) => ({
      key,
      operationType,
      operationLabel,
    }));

  return {
    series,
    data: listApplicationMonitoringBucketStarts(monitoring).map(
      (bucketStart) =>
        ({
          bucketStart,
          ...Object.fromEntries(
            series.map(({ key }) => [
              key,
              creditsUsedByBucketStartAndSeriesKey.get(
                `${bucketStart}|${key}`,
              ) ?? 0,
            ]),
          ),
        }) as ApplicationMonitoringChartDatum<ApplicationMonitoringCreditSeriesKey>,
    ),
  };
};
