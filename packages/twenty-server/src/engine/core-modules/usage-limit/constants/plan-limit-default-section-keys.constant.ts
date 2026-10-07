import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';

export const PLAN_LIMIT_DEFAULT_SECTION_KEYS = [
  'values',
  'trialValues',
] as const satisfies (keyof PlanUsageLimitDefaults)[];
