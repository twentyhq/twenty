import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { isDefined } from 'twenty-shared/utils';
import { BillingProductKey } from '~/generated-metadata/graphql';

export const markWorkspaceCreditsExhausted = (
  currentWorkspace: CurrentWorkspace | null,
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
          ? { ...item, hasReachedCurrentPeriodCap: true }
          : item,
      ),
    },
  };
};
