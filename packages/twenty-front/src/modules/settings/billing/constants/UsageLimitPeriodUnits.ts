// Mirrors the server's PERIOD_UNITS. The quota form offers only the anchored
// subset, which ANCHORED_USAGE_LIMIT_PERIOD_UNITS carries.
export const USAGE_LIMIT_PERIOD_UNITS = [
  'second',
  'day',
  'week',
  'month',
  'allowancePeriod',
  'lifetime',
] as const;
