import { type APPLICATION_REGISTRATION_METRIC_NAMES } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-metric-names.constant';

export type ApplicationRegistrationMetricName =
  (typeof APPLICATION_REGISTRATION_METRIC_NAMES)[number];
