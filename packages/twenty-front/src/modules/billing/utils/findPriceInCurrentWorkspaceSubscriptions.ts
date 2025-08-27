import {
  type BillingPriceOutput,
  type BillingSubscriptionItem,
} from '~/generated/graphql';
import { findOrThrow } from '~/utils/array/findOrThrow';

export const findMeteredPriceInCurrentWorkspaceSubscriptions = (
  subscriptionItems: Array<BillingSubscriptionItem>,
  meteredBillingPrices: Array<BillingPriceOutput>,
): BillingPriceOutput =>
  findOrThrow(meteredBillingPrices, (meteredBillingPrice) =>
    subscriptionItems.some(
      (subscriptionItem) =>
        subscriptionItem.stripePriceId === meteredBillingPrice.stripePriceId,
    ),
  );
