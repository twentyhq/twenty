import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

export type BillingSubscriptionChange =
  | { type: 'SWITCH_PLAN'; targetPlanKey: BillingPlanKey }
  | { type: 'SWITCH_INTERVAL'; targetInterval: SettingsBillingPlanInterval }
  | { type: 'CANCEL_PLAN_SWITCH' }
  | { type: 'CANCEL_INTERVAL_SWITCH' };
