/* @license Enterprise */

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { isSellableBillingPrice } from 'src/engine/core-modules/billing/utils/is-sellable-billing-price.util';

const getCentsPerMicroCredit = (price: BillingPriceEntity): number =>
  Number(price.unitAmount) / Number(price.metadata?.credit_amount);

// The cheapest paid tier, not the current one: the free tier costs nothing and old prices count credits in another unit
export const findCreditTopUpPrice = (
  subscription: Pick<
    BillingSubscriptionEntity,
    'billingSubscriptionItems' | 'interval' | 'currency'
  >,
): BillingPriceEntity | undefined => {
  const resourceCreditItem = subscription.billingSubscriptionItems.find(
    ({ billingProduct }) =>
      billingProduct?.metadata?.productKey ===
      BillingProductKey.RESOURCE_CREDIT,
  );

  const paidPrices = (resourceCreditItem?.billingProduct?.billingPrices ?? [])
    .filter(
      (price) =>
        isSellableBillingPrice(price) &&
        price.interval === subscription.interval &&
        price.currency.toUpperCase() === subscription.currency.toUpperCase() &&
        Number(price.unitAmount) > 0 &&
        Number(price.metadata?.credit_amount) > 0,
    )
    .sort((a, b) => getCentsPerMicroCredit(a) - getCentsPerMicroCredit(b));

  return paidPrices[0];
};
