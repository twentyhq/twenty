import type { ApplicationHealthCheckResult } from 'twenty-shared/application';

export type HealthCheckHandler = () =>
  | ApplicationHealthCheckResult
  | Promise<ApplicationHealthCheckResult>;
