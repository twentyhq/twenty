import { APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-one-day-in-ms.constant';
import { getStartOfUtcDay } from 'src/engine/core-modules/application/application-registration-analytics/utils/get-start-of-utc-day.util';

// Daily cells are the only reporting unit, so a sub-day window would report partial cells against whole-day points
export const snapApplicationRegistrationAnalyticsPeriodToUtcDays = ({
  periodStart,
  periodEnd,
}: {
  periodStart: Date;
  periodEnd: Date;
}): { periodStart: Date; periodEnd: Date } => {
  const snappedPeriodEndStart = getStartOfUtcDay(periodEnd);
  const snappedPeriodEnd =
    snappedPeriodEndStart.getTime() === periodEnd.getTime()
      ? snappedPeriodEndStart
      : new Date(
          snappedPeriodEndStart.getTime() +
            APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS,
        );

  return {
    periodStart: getStartOfUtcDay(periodStart),
    periodEnd: snappedPeriodEnd,
  };
};
