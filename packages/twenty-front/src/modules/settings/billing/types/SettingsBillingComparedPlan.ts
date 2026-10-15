import { type SettingsBillingPlanAction } from '@/settings/billing/types/SettingsBillingPlanAction';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

export type SettingsBillingComparedPlan = {
  action: SettingsBillingPlanAction;
  planKey: BillingPlanKey;
};
