export const APPLICATION_REGISTRATION_METRIC_ERROR_CATEGORIES = [
  'TIMEOUT',
  'OUT_OF_MEMORY',
  'RUNTIME',
  'THROWN',
  'EXECUTION_FAILED',
  'UNKNOWN',
] as const;

export type ApplicationRegistrationMetricErrorCategory =
  (typeof APPLICATION_REGISTRATION_METRIC_ERROR_CATEGORIES)[number];
