import { APPLICATION_REGISTRATION_ANALYTICS_DEFAULT_PERIOD_DAYS } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-default-period-days.constant';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

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

  return { periodStart: resolvedPeriodStart, periodEnd: resolvedPeriodEnd };
};
