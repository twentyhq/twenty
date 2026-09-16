import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useNextPlan } from '@/settings/billing/hooks/useNextPlan';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { getBillingStateAfterScheduledChange } from '@/settings/billing/utils/getBillingStateAfterScheduledChange';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useBillingStateAfterScheduledChange = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { nextPlan } = useNextPlan();
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;

  const { interval, planKey } = getBillingStateAfterScheduledChange({
    currentInterval: currentBillingSubscription?.interval,
    currentPlanKey: getSubscriptionPlanKey(currentBillingSubscription),
    scheduledInterval:
      splitedPhaseItemsInPrices.nextBasePrice?.recurringInterval,
    scheduledPlanKey: nextPlan?.planKey,
  });

  return {
    intervalAfterScheduledChange: interval,
    planKeyAfterScheduledChange: planKey,
  };
};
