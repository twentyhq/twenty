// The OpenTelemetry defaults stop at 10s, which caps the p99 queue wait panel
// below the thresholds it is meant to flag
export const JOB_LATENCY_MS_BUCKET_BOUNDARIES = [
  50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000, 120000, 300000,
  600000, 1800000, 3600000,
] as const;
