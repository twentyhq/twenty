/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';

// Items the catalog does not know are carried through: a phase is declarative,
// so anything left out is dropped at the period boundary.
export const buildPhaseUpdateParams = ({
  currentPhase,
  productKeyByPriceId,
  toUpdatePrices,
  startDate,
  endDate,
}: {
  currentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
  productKeyByPriceId: Map<string, BillingProductKey>;
  toUpdatePrices: SubscriptionStripePrices;
  startDate: Stripe.SubscriptionScheduleUpdateParams.Phase['start_date'];
  endDate: number | undefined;
}): Stripe.SubscriptionScheduleUpdateParams.Phase => {
  const currentItems = currentPhase.items ?? [];

  const getProductKey = (price: string | undefined) =>
    isDefined(price) ? productKeyByPriceId.get(price) : undefined;

  const hasBaseProductItem = currentItems.some(
    ({ price }) => getProductKey(price) === BillingProductKey.BASE_PRODUCT,
  );

  if (!hasBaseProductItem) {
    throw new BillingException(
      'Subscription schedule phase has no base product item',
      BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID,
      {
        userFriendlyMessage: msg`Your billing subscription is corrupted. Please contact support.`,
      },
    );
  }

  return {
    start_date: startDate,
    ...(endDate ? { end_date: endDate } : {}),
    proration_behavior: 'none',
    items: currentItems.map((item) => {
      switch (getProductKey(item.price)) {
        case BillingProductKey.BASE_PRODUCT:
          return {
            price: toUpdatePrices.baseProductPriceId,
            quantity: toUpdatePrices.seats,
          };
        case BillingProductKey.RESOURCE_CREDIT:
          return {
            price: toUpdatePrices.resourceCreditPriceId,
            quantity: 1,
          };
        default:
          return item;
      }
    }),
  };
};
