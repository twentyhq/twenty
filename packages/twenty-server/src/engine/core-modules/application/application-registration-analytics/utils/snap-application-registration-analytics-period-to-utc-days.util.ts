import { APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-one-day-in-ms.constant';

const startOfUtcDay = (date: Date): Date =>
  new Date(
    Math.floor(
      date.getTime() / APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS,
    ) * APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS,
  );

// Whole UTC days are the only reporting unit: a caller cannot carve a window narrower than the daily cells it is built from
export const snapApplicationRegistrationAnalyticsPeriodToUtcDays = ({
  periodStart,
  periodEnd,
}: {
  periodStart: Date;
  periodEnd: Date;
}): { periodStart: Date; periodEnd: Date } => {
  const snappedPeriodEndStart = startOfUtcDay(periodEnd);
  const snappedPeriodEnd =
    snappedPeriodEndStart.getTime() === periodEnd.getTime()
      ? snappedPeriodEndStart
      : new Date(
          snappedPeriodEndStart.getTime() +
            APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS,
        );

  return {
    periodStart: startOfUtcDay(periodStart),
    periodEnd: snappedPeriodEnd,
  };
};
