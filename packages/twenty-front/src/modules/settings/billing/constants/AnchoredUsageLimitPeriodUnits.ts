import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';

export const ANCHORED_USAGE_LIMIT_PERIOD_UNITS = [
  'day',
  'week',
  'month',
  'allowancePeriod',
] as const satisfies readonly UsageLimitPeriodUnit[];
