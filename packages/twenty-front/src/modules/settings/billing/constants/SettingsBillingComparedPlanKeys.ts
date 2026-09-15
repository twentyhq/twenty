import { BillingPlanKey } from '~/generated-metadata/graphql';

export const SETTINGS_BILLING_COMPARED_PLAN_KEYS = [
  BillingPlanKey.PRO,
  BillingPlanKey.ENTERPRISE,
] as const;
