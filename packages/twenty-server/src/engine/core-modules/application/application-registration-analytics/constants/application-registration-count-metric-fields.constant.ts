import { type ApplicationRegistrationMetricName } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-name.type';

export const APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS = {
  'install.succeeded': 'installSucceeded',
  'install.failed': 'installFailed',
  'upgrade.succeeded': 'upgradeSucceeded',
  'upgrade.failed': 'upgradeFailed',
  'uninstall.succeeded': 'uninstallSucceeded',
  'uninstall.failed': 'uninstallFailed',
  'function.execution': 'functionExecutions',
  'function.error': 'functionErrors',
  'api.rate_limited': 'apiRateLimited',
  'job.rate_limited': 'jobRateLimited',
} as const satisfies Partial<Record<ApplicationRegistrationMetricName, string>>;

export type ApplicationRegistrationCountMetric =
  keyof typeof APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS;

export type ApplicationRegistrationCountField =
  (typeof APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS)[ApplicationRegistrationCountMetric];

export const isApplicationRegistrationCountMetric = (
  metric: string,
): metric is ApplicationRegistrationCountMetric =>
  Object.prototype.hasOwnProperty.call(
    APPLICATION_REGISTRATION_COUNT_METRIC_FIELDS,
    metric,
  );
