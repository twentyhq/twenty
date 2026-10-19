import { formatInTimeZone } from 'date-fns-tz';
import { doNotTranslate } from 'twenty-shared/i18n';

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
    ? formatDate(bucketStart, doNotTranslate('HH:mm'))
    : formatInTimeZone(
        bucketStart,
        doNotTranslate('UTC'),
        doNotTranslate('MMM d'),
      );
