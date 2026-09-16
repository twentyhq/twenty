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

  const isPlanSwitchScheduled =
    isDefined(scheduledPlanKey) && scheduledPlanKey !== currentPlanKey;
  const isIntervalSwitchScheduled =
    isDefined(scheduledInterval) && scheduledInterval !== currentInterval;

  const planKeyAfterScheduledChange = isPlanSwitchScheduled
    ? scheduledPlanKey
    : currentPlanKey;
  const intervalAfterScheduledChange = isIntervalSwitchScheduled
    ? scheduledInterval
    : currentInterval;

  const isPlanAfterScheduledChange = planKey === planKeyAfterScheduledChange;
  const isIntervalAfterScheduledChange =
    selectedInterval === intervalAfterScheduledChange;

  if (!isPlanAfterScheduledChange && !isIntervalAfterScheduledChange) {
    if (isPlanSwitchScheduled) {
      return 'CANCEL_PLAN_SWITCH';
    }

    if (isIntervalSwitchScheduled) {
      return 'CANCEL_INTERVAL_SWITCH';
    }

    return 'SWITCH_INTERVAL_FIRST';
  }

  if (!isPlanAfterScheduledChange) {
    return isCurrentPlan ? 'CANCEL_PLAN_SWITCH' : 'SWITCH_PLAN';
  }

  return isCurrentInterval ? 'CANCEL_INTERVAL_SWITCH' : 'SWITCH_INTERVAL';
};
