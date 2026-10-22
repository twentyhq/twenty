import { type BillingPlanSwitches } from '@/settings/billing/types/BillingPlanSwitches';
import { type BillingSubscriptionChange } from '@/settings/billing/types/BillingSubscriptionChange';
import { getReverseTrialPlanKeys } from '@/settings/billing/utils/getReverseTrialPlanKeys';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  type BillingPlan,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

export const isBillingSubscriptionChangeImmediate = ({
  change,
  currentPlan,
  subscriptionStatus,
}: {
  change: BillingSubscriptionChange;
  currentPlan: BillingPlanSwitches &
    Pick<BillingPlan, 'isCheckoutDefault' | 'planKey'>;
  subscriptionStatus: SubscriptionStatus | undefined;
}) => {
  if (subscriptionStatus === SubscriptionStatus.Trialing) {
    // Only the default plan can be the reverse trial plan, so the current plan alone is enough.
    const isReverseTrialDowngrade =
      change.type === 'SWITCH_PLAN' &&
      getReverseTrialPlanKeys([currentPlan])?.downgradePlanKey ===
        change.targetPlanKey;

    return !isReverseTrialDowngrade;
  }

  switch (change.type) {
    case 'SWITCH_PLAN':
      return !currentPlan.downgradePlanKeys.includes(change.targetPlanKey);
    case 'SWITCH_INTERVAL':
      return change.targetInterval === SubscriptionInterval.Year;
    case 'CANCEL_PLAN_SWITCH':
    case 'CANCEL_INTERVAL_SWITCH':
      return true;
    default:
      return assertUnreachable(change);
  }
};
