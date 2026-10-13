import { type APPLICATION_REGISTRATION_METRIC_ERROR_CATEGORIES } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-metric-error-categories.constant';

export type ApplicationRegistrationMetricErrorCategory =
  (typeof APPLICATION_REGISTRATION_METRIC_ERROR_CATEGORIES)[number];
