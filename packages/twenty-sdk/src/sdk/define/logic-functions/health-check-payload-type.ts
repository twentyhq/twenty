import type { ApplicationHealthCheckResult } from 'twenty-shared/application';

export type HealthCheckPayload = {
  version?: string;
};

export type HealthCheckHandler = (
  payload: HealthCheckPayload,
) => ApplicationHealthCheckResult | Promise<ApplicationHealthCheckResult>;
