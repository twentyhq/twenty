import { BillingPlanKey } from '~/generated-metadata/graphql';

// Column order of the plan comparison table.
export const SETTINGS_BILLING_COMPARED_PLAN_KEYS = [
  BillingPlanKey.PRO,
  BillingPlanKey.ENTERPRISE,
] as const;
