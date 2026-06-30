/* @license Enterprise */

import { findOrThrow } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

// V2 counterpart of get-metered-billing-subscription-item-or-throw.util.ts
// Identifies the credit item by productKey === RESOURCE_CREDIT (not quantity == null)
export const getCurrentResourceCreditSubscriptionItemOrThrow = (
  billingSubscription: BillingSubscriptionEntity,
) => {
  return findOrThrow(
    billingSubscription.billingSubscriptionItems,
    ({ billingProduct }) =>
      billingProduct.metadata.productKey === BillingProductKey.RESOURCE_CREDIT,
  );
};
