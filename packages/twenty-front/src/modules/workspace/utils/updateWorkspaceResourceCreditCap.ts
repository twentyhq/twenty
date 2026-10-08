import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { isResourceCreditSubscriptionItem } from '@/workspace/utils/isResourceCreditSubscriptionItem';
import { isDefined } from 'twenty-shared/utils';

const updateWorkspaceResourceCreditCap = (
  currentWorkspace: CurrentWorkspace | null,
  hasReachedCurrentPeriodCap: boolean,
): CurrentWorkspace | null => {
  const currentBillingSubscription =
    currentWorkspace?.currentBillingSubscription;
  const billingSubscriptionItems =
    currentBillingSubscription?.billingSubscriptionItems;

  if (
    !isDefined(currentWorkspace) ||
    !isDefined(currentBillingSubscription) ||
    !isDefined(billingSubscriptionItems)
  ) {
    return currentWorkspace;
  }

  return {
    ...currentWorkspace,
    currentBillingSubscription: {
      ...currentBillingSubscription,
      billingSubscriptionItems: billingSubscriptionItems.map((item) =>
        isResourceCreditSubscriptionItem(item)
          ? { ...item, hasReachedCurrentPeriodCap }
          : item,
      ),
    },
  };
};

export const markWorkspaceCreditsExhausted = (
  currentWorkspace: CurrentWorkspace | null,
): CurrentWorkspace | null =>
  updateWorkspaceResourceCreditCap(currentWorkspace, true);

// A send that passed the server credit gate is the only client-side signal of an external top-up
export const markWorkspaceCreditsAvailable = (
  currentWorkspace: CurrentWorkspace | null,
): CurrentWorkspace | null =>
  updateWorkspaceResourceCreditCap(currentWorkspace, false);
