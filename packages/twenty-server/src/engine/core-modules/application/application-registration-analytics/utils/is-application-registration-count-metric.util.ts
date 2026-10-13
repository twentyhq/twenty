import {
  APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS,
  type ApplicationRegistrationCountMetric,
} from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-count-metric-fields.constant';

export const isApplicationRegistrationCountMetric = (
  metric: string,
): metric is ApplicationRegistrationCountMetric =>
  Object.prototype.hasOwnProperty.call(
    APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS,
    metric,
  );
