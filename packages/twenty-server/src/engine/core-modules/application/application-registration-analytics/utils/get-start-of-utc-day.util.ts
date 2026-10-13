import { APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-one-day-in-ms.constant';

export const getStartOfUtcDay = (date: Date): Date =>
  new Date(
    Math.floor(
      date.getTime() / APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS,
    ) * APPLICATION_REGISTRATION_ANALYTICS_ONE_DAY_IN_MS,
  );
