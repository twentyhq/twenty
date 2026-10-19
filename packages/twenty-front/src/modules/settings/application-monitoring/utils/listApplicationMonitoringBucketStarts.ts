import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';

export const listApplicationMonitoringBucketStarts = ({
  periodStart,
  periodEnd,
  bucketSizeInSeconds,
}: Pick<
  ApplicationMonitoringData,
  'periodStart' | 'periodEnd' | 'bucketSizeInSeconds'
>): string[] => {
  const bucketSizeInMilliseconds = bucketSizeInSeconds * 1000;
  const periodEndTime = new Date(periodEnd).getTime();
  const bucketStarts: string[] = [];

  for (
    let bucketStartTime =
      Math.floor(new Date(periodStart).getTime() / bucketSizeInMilliseconds) *
      bucketSizeInMilliseconds;
    bucketStartTime < periodEndTime;
    bucketStartTime += bucketSizeInMilliseconds
  ) {
    bucketStarts.push(new Date(bucketStartTime).toISOString());
  }

  return bucketStarts;
};
