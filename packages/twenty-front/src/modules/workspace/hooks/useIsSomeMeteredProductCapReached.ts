import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useIsSomeMeteredProductCapReached = (): boolean => {
  const billingSubscriptionItems = useRecoilValueV2(currentWorkspaceState)
    ?.currentBillingSubscription?.billingSubscriptionItems;

  if (!billingSubscriptionItems) {
    return false;
  }

  return billingSubscriptionItems.some(
    ({ hasReachedCurrentPeriodCap }) => hasReachedCurrentPeriodCap,
  );
};
