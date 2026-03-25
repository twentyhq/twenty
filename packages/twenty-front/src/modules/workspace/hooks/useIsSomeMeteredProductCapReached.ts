import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsSomeMeteredProductCapReached = (): boolean => {
  const billingSubscriptionItems = useAtomStateValue(currentWorkspaceState)
    ?.currentBillingSubscription?.billingSubscriptionItems;

  if (!billingSubscriptionItems) {
    return false;
  }

  return billingSubscriptionItems.some(
    ({ hasReachedCurrentPeriodCap }) => hasReachedCurrentPeriodCap,
  );
};
