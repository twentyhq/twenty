import { APPLICATION_REGISTRATION_ANALYTICS_DEFAULT_PERIOD_DAYS } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-default-period-days.constant';
import { APPLICATION_REGISTRATION_ANALYTICS_MAX_PERIOD_DAYS } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-max-period-days.constant';
import { snapApplicationRegistrationAnalyticsPeriodToUtcDays } from 'src/engine/core-modules/application/application-registration-analytics/utils/snap-application-registration-analytics-period-to-utc-days.util';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

// Bounded because the time series allocates one point per day of the period
export const resolveApplicationRegistrationAnalyticsPeriod = ({
  periodStart,
  periodEnd,
}: {
  periodStart?: Date | null;
  periodEnd?: Date | null;
}): { periodStart: Date; periodEnd: Date } => {
  const resolvedPeriodEnd = periodEnd ?? new Date();
  const resolvedPeriodStart =
    periodStart ??
    new Date(
      resolvedPeriodEnd.getTime() -
        APPLICATION_REGISTRATION_ANALYTICS_DEFAULT_PERIOD_DAYS * ONE_DAY_IN_MS,
    );

  if (resolvedPeriodStart.getTime() > resolvedPeriodEnd.getTime()) {
    throw new ApplicationRegistrationException(
      'Analytics period start must be before its end',
      ApplicationRegistrationExceptionCode.INVALID_INPUT,
    );
  }

  const periodInMs =
    resolvedPeriodEnd.getTime() - resolvedPeriodStart.getTime();

  if (
    periodInMs >
    APPLICATION_REGISTRATION_ANALYTICS_MAX_PERIOD_DAYS * ONE_DAY_IN_MS
  ) {
    throw new ApplicationRegistrationException(
      `Analytics period cannot exceed ${APPLICATION_REGISTRATION_ANALYTICS_MAX_PERIOD_DAYS} days`,
      ApplicationRegistrationExceptionCode.INVALID_INPUT,
    );
  }

  return snapApplicationRegistrationAnalyticsPeriodToUtcDays({
    periodStart: resolvedPeriodStart,
    periodEnd: resolvedPeriodEnd,
  });
};
