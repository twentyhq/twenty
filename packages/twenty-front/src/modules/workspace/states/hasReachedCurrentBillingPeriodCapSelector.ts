import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const hasReachedCurrentBillingPeriodCapSelector = createAtomSelector({
  key: 'hasReachedCurrentBillingPeriodCapSelector',
  get: ({ get }) => {
    const billingSubscriptionItems = get(currentWorkspaceState)
      ?.currentBillingSubscription?.billingSubscriptionItems;

    if (!billingSubscriptionItems) {
      return false;
    }

    return billingSubscriptionItems.some(
      ({ hasReachedCurrentPeriodCap }) => hasReachedCurrentPeriodCap,
    );
  },
});
