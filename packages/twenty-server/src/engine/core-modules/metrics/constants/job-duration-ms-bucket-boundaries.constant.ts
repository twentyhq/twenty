// Shared by queue-wait and execution histograms: waits range from
// milliseconds on an idle queue to tens of minutes when workers are saturated,
// and long-running jobs (syncs, AI streams) run for minutes.
export const JOB_DURATION_MS_BUCKET_BOUNDARIES = [
  50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000, 120000, 300000,
  600000, 1800000, 3600000,
] as const;
