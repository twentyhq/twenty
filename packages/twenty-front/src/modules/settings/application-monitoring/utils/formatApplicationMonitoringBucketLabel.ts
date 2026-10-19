import { formatInTimeZone } from 'date-fns-tz';

import { formatDate } from '~/utils/date-utils';

const DAY_IN_SECONDS = 24 * 60 * 60;

export const formatApplicationMonitoringBucketLabel = ({
  bucketStart,
  bucketSizeInSeconds,
}: {
  bucketStart: string;
  bucketSizeInSeconds: number;
}): string =>
  bucketSizeInSeconds < DAY_IN_SECONDS
    ? formatDate(bucketStart, 'HH:mm')
    : formatInTimeZone(bucketStart, 'UTC', 'MMM d');
