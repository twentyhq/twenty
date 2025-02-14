export const HEALTH_ERROR_MESSAGES = {
  NO_ACTIVE_WORKERS: 'No active workers found',
  WORKER_TIMEOUT: 'Worker check timeout',
  DATABASE_TIMEOUT: 'Database timeout',
  REDIS_TIMEOUT: 'Redis timeout',
  DATABASE_CONNECTION_FAILED: 'Database connection failed',
  REDIS_CONNECTION_FAILED: 'Unknown Redis error',
  WORKER_CHECK_FAILED: 'Worker check failed',
} as const;
