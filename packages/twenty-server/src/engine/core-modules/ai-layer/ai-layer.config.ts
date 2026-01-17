export const AI_LAYER_CONFIG = {
  // Timeouts in milliseconds
  ERROR_REPORT_TIMEOUT: 5000,
  HEALTH_CHECK_TIMEOUT: 3000,

  // Retry configuration
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,

  // Default values
  DEFAULT_CRITICALITY: 'error' as const,
} as const;
