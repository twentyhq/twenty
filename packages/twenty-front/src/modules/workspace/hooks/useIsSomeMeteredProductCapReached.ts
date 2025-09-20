import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useIsSomeMeteredProductCapReached = (): boolean => {
  const billingSubscriptionItems = useRecoilValue(currentWorkspaceState)
    ?.currentBillingSubscription?.billingSubscriptionItems;

  if (!billingSubscriptionItems) {
    return false;
  }

  return billingSubscriptionItems.some(
    ({ hasReachedCurrentPeriodCap }) => hasReachedCurrentPeriodCap,
  );
};
