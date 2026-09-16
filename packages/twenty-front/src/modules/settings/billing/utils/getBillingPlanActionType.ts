import { type SettingsBillingPlanActionType } from '@/settings/billing/types/settingsBillingPlanAction.type';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

type GetBillingPlanActionTypeParams = {
  canSwitchSubscription: boolean;
  currentInterval: SubscriptionInterval | null | undefined;
  currentPlanKey: BillingPlanKey;
  hasPermissionToManageBilling: boolean;
  isCancellationScheduled: boolean;
  isSubscriptionCanceled: boolean;
  planKey: BillingPlanKey;
  scheduledInterval: SubscriptionInterval | null | undefined;
  scheduledPlanKey: BillingPlanKey | null | undefined;
  selectedInterval: SettingsBillingPlanInterval;
  shouldUpdatePayment: boolean;
};

export const getBillingPlanActionType = ({
  canSwitchSubscription,
  currentInterval,
  currentPlanKey,
  hasPermissionToManageBilling,
  isCancellationScheduled,
  isSubscriptionCanceled,
  planKey,
  scheduledInterval,
  scheduledPlanKey,
  selectedInterval,
  shouldUpdatePayment,
}: GetBillingPlanActionTypeParams): SettingsBillingPlanActionType => {
  if (isSubscriptionCanceled) {
    return 'MANAGE_BILLING';
  }

  const isCurrentPlan = planKey === currentPlanKey;
  const isCurrentInterval = selectedInterval === currentInterval;

  if (isCurrentPlan && isCurrentInterval) {
    return 'CURRENT';
  }

  if (planKey === scheduledPlanKey && selectedInterval === scheduledInterval) {
    return 'SCHEDULED';
  }

  if (shouldUpdatePayment) {
    return 'UPDATE_PAYMENT';
  }

  if (isCancellationScheduled) {
    return 'MANAGE_BILLING';
  }

  if (!canSwitchSubscription) {
    return hasPermissionToManageBilling ? 'UNAVAILABLE' : 'CONTACT_ADMIN';
  }

  // A further change is applied to the scheduled phase, not to the subscription
  // as it stands today, so that phase is what the remaining cells compare to.
  const isPlanSwitchScheduled =
    isDefined(scheduledPlanKey) && scheduledPlanKey !== currentPlanKey;
  const isIntervalSwitchScheduled =
    isDefined(scheduledInterval) && scheduledInterval !== currentInterval;

  const isBaselinePlan =
    planKey === (isPlanSwitchScheduled ? scheduledPlanKey : currentPlanKey);
  const isBaselineInterval =
    selectedInterval ===
    (isIntervalSwitchScheduled ? scheduledInterval : currentInterval);

  if (!isBaselinePlan && !isBaselineInterval) {
    if (isPlanSwitchScheduled) {
      return 'CANCEL_PLAN_SWITCH';
    }

    if (isIntervalSwitchScheduled) {
      return 'CANCEL_INTERVAL_SWITCH';
    }

    return 'SWITCH_INTERVAL_FIRST';
  }

  return isBaselinePlan ? 'SWITCH_INTERVAL' : 'SWITCH_PLAN';
};
