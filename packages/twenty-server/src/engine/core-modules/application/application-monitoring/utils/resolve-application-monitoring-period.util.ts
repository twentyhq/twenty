import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_MONITORING_BUCKET_SIZES_IN_SECONDS } from 'src/engine/core-modules/application/application-monitoring/constants/application-monitoring-bucket-sizes-in-seconds.constant';
import { APPLICATION_MONITORING_DEFAULT_PERIOD_IN_HOURS } from 'src/engine/core-modules/application/application-monitoring/constants/application-monitoring-default-period-in-hours.constant';

const HOUR_IN_MS = 60 * 60 * 1000;

export type ApplicationMonitoringPeriod = {
  periodStart: Date;
  periodEnd: Date;
  bucketSizeInSeconds: number;
};

const getBucketSizeInSeconds = (periodInMs: number): number => {
  if (periodInMs <= 3 * HOUR_IN_MS) {
    return APPLICATION_MONITORING_BUCKET_SIZES_IN_SECONDS.FIVE_MINUTES;
  }

  if (periodInMs <= 48 * HOUR_IN_MS) {
    return APPLICATION_MONITORING_BUCKET_SIZES_IN_SECONDS.HOUR;
  }

  return APPLICATION_MONITORING_BUCKET_SIZES_IN_SECONDS.DAY;
};

export const resolveApplicationMonitoringPeriod = ({
  periodStart,
  periodEnd,
  lookbackInHours,
  now = new Date(),
}: {
  periodStart?: Date;
  periodEnd?: Date;
  lookbackInHours: number;
  now?: Date;
}): ApplicationMonitoringPeriod => {
  const earliestStart = new Date(now.getTime() - lookbackInHours * HOUR_IN_MS);

  const clampedEnd = isDefined(periodEnd) && periodEnd < now ? periodEnd : now;
  const resolvedEnd = clampedEnd < earliestStart ? earliestStart : clampedEnd;

  const requestedStart =
    periodStart ??
    new Date(
      resolvedEnd.getTime() -
        APPLICATION_MONITORING_DEFAULT_PERIOD_IN_HOURS * HOUR_IN_MS,
    );
  const clampedStart =
    requestedStart < earliestStart ? earliestStart : requestedStart;
  const resolvedStart = clampedStart > resolvedEnd ? resolvedEnd : clampedStart;

  return {
    periodStart: resolvedStart,
    periodEnd: resolvedEnd,
    bucketSizeInSeconds: getBucketSizeInSeconds(
      resolvedEnd.getTime() - resolvedStart.getTime(),
    ),
  };
};
