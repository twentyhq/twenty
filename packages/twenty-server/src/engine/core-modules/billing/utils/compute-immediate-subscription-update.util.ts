/* @license Enterprise */

import {
  type SubscriptionUpdate,
  SubscriptionUpdateType,
} from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';
import { isSameApplicationItems } from 'src/engine/core-modules/billing/utils/is-same-application-items.util';

export const computeImmediateSubscriptionUpdate = ({
  subscriptionUpdate,
  currentPrices,
  toUpdatePrices,
}: {
  subscriptionUpdate: SubscriptionUpdate;
  currentPrices: SubscriptionStripePrices;
  toUpdatePrices: SubscriptionStripePrices;
}): SubscriptionUpdate | undefined => {
  if (
    toUpdatePrices.baseProductPriceId !== currentPrices.baseProductPriceId ||
    toUpdatePrices.resourceCreditPriceId !== currentPrices.resourceCreditPriceId
  ) {
    return subscriptionUpdate;
  }

  if (
    toUpdatePrices.seats === currentPrices.seats &&
    isSameApplicationItems({
      currentApplicationItems: currentPrices.applicationItems,
      toUpdateApplicationItems: toUpdatePrices.applicationItems,
    })
  ) {
    return undefined;
  }

  return {
    type: SubscriptionUpdateType.QUANTITIES,
    newSeats: toUpdatePrices.seats,
  };
};
