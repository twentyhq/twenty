import { type BillingPlanSwitches } from '@/settings/billing/types/BillingPlanSwitches';
import { type BillingSubscriptionChange } from '@/settings/billing/types/BillingSubscriptionChange';
import { assertUnreachable } from 'twenty-shared/utils';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/SettingsBillingPlanComparison';
import {
  type BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const isBillingSubscriptionChangeUpgrade = ({
  change,
  currentPlan,
  upcomingInterval,
  upcomingPlanKey,
}: {
  change: BillingSubscriptionChange;
  currentPlan: BillingPlanSwitches;
  upcomingInterval: SettingsBillingPlanInterval;
  upcomingPlanKey: BillingPlanKey;
}) => {
  switch (change.type) {
    case 'SWITCH_PLAN':
      return currentPlan.upgradePlanKeys.includes(change.targetPlanKey);
    case 'SWITCH_INTERVAL':
      return change.targetInterval === SubscriptionInterval.Year;
    case 'CANCEL_PLAN_SWITCH':
      return currentPlan.downgradePlanKeys.includes(upcomingPlanKey);
    case 'CANCEL_INTERVAL_SWITCH':
      return upcomingInterval === SubscriptionInterval.Month;
    default:
      return assertUnreachable(change);
  }
};
