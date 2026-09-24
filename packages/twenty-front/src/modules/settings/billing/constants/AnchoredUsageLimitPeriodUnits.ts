import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';

// Mirrors the server's ANCHORED_PERIOD_UNITS: 'second' belongs to speed limits
// and 'lifetime' to stock limits, neither of which this form writes.
export const ANCHORED_USAGE_LIMIT_PERIOD_UNITS = [
  'day',
  'week',
  'month',
  'allowancePeriod',
] as const satisfies readonly UsageLimitPeriodUnit[];
