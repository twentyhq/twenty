import { type SettingsBillingPlanActionType } from '@/settings/billing/types/settingsBillingPlanAction.type';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { getBillingStateAfterScheduledChange } from '@/settings/billing/utils/getBillingStateAfterScheduledChange';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

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

  const stateAfterScheduledChange = getBillingStateAfterScheduledChange({
    currentInterval,
    currentPlanKey,
    scheduledInterval,
    scheduledPlanKey,
  });

  const isPlanAfterScheduledChange =
    planKey === stateAfterScheduledChange.planKey;
  const isIntervalAfterScheduledChange =
    selectedInterval === stateAfterScheduledChange.interval;

  if (!isPlanAfterScheduledChange && !isIntervalAfterScheduledChange) {
    if (stateAfterScheduledChange.isPlanSwitchScheduled) {
      return 'CANCEL_PLAN_SWITCH';
    }

    if (stateAfterScheduledChange.isIntervalSwitchScheduled) {
      return 'CANCEL_INTERVAL_SWITCH';
    }

    return 'SWITCH_INTERVAL_FIRST';
  }

  if (!isPlanAfterScheduledChange) {
    return isCurrentPlan ? 'CANCEL_PLAN_SWITCH' : 'SWITCH_PLAN';
  }

  return isCurrentInterval ? 'CANCEL_INTERVAL_SWITCH' : 'SWITCH_INTERVAL';
};
