import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { isDefined } from 'twenty-shared/utils';
import { BillingProductKey } from '~/generated-metadata/graphql';

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
        item.billingProduct.metadata?.['productKey'] ===
        BillingProductKey.RESOURCE_CREDIT
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

// The optimistic inverse of markWorkspaceCreditsExhausted: a send that passed
// the server credit gate proves credits are available right now, which is the
// only client-side signal after an external top-up while the app stays open.
export const markWorkspaceCreditsAvailable = (
  currentWorkspace: CurrentWorkspace | null,
): CurrentWorkspace | null =>
  updateWorkspaceResourceCreditCap(currentWorkspace, false);
