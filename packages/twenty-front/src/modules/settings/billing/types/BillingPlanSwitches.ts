import { type BillingPlan } from '~/generated-metadata/graphql';

export type BillingPlanSwitches = Pick<
  BillingPlan,
  'downgradePlanKeys' | 'upgradePlanKeys'
>;
