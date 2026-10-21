/* @license Enterprise */

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';

export const resolveManagedItemPrice = ({
  productKey,
  toUpdatePrices,
}: {
  productKey: BillingProductKey | undefined | null;
  toUpdatePrices: SubscriptionStripePrices;
}): { price: string; quantity: number } | undefined => {
  switch (productKey) {
    case BillingProductKey.BASE_PRODUCT:
      return {
        price: toUpdatePrices.baseProductPriceId,
        quantity: toUpdatePrices.seats,
      };
    case BillingProductKey.RESOURCE_CREDIT:
      return { price: toUpdatePrices.resourceCreditPriceId, quantity: 1 };
    default:
      return undefined;
  }
};
