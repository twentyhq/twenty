import {
  type BillingPriceOutput,
  type BillingSubscriptionItem,
} from '~/generated/graphql';

export const findMeteredPriceInCurrentWorkspaceSubscriptions = (
  subscriptionItems: Array<BillingSubscriptionItem>,
  meteredBillingPrices: Array<BillingPriceOutput>,
) =>
  meteredBillingPrices.find((meteredBillingPrice) =>
    subscriptionItems.some(
      (subscriptionItem) =>
        subscriptionItem.stripePriceId === meteredBillingPrice.stripePriceId,
    ),
  );
