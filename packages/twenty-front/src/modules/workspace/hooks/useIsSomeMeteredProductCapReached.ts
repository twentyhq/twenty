import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useIsSomeMeteredProductCapReached = (): boolean => {
  const billingSubscriptionItems = useAtomValue(currentWorkspaceState)
    ?.currentBillingSubscription?.billingSubscriptionItems;

  if (!billingSubscriptionItems) {
    return false;
  }

  return billingSubscriptionItems.some(
    ({ hasReachedCurrentPeriodCap }) => hasReachedCurrentPeriodCap,
  );
};
