import { formatInTimeZone } from 'date-fns-tz';
import { doNotTranslate } from 'twenty-shared/i18n';

import { formatDate } from '~/utils/date-utils';

const HOUR_IN_SECONDS = 60 * 60;
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;

// Labels are the chart's x values, so hourly buckets carry the day: a 24h period spans 25 of them
export const formatApplicationMonitoringBucketLabel = ({
  bucketStart,
  bucketSizeInSeconds,
}: {
  bucketStart: string;
  bucketSizeInSeconds: number;
}): string => {
  if (bucketSizeInSeconds < HOUR_IN_SECONDS) {
    return formatDate(bucketStart, doNotTranslate('HH:mm'));
  }

  if (bucketSizeInSeconds < DAY_IN_SECONDS) {
    return formatDate(bucketStart, doNotTranslate('MMM d HH:mm'));
  }

  return formatInTimeZone(
    bucketStart,
    doNotTranslate('UTC'),
    doNotTranslate('MMM d'),
  );
};
