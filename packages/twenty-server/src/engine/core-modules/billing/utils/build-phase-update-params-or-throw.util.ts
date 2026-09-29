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
import { resolveManagedItemPrice } from 'src/engine/core-modules/billing/utils/resolve-managed-item-price.util';

export const buildPhaseUpdateParamsOrThrow = ({
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

  const resolvedProductKeys = currentItems.map(({ price }) =>
    getProductKey(price),
  );

  const assertPhaseHolds = (productKey: BillingProductKey, label: string) => {
    if (resolvedProductKeys.includes(productKey)) {
      return;
    }

    throw new BillingException(
      `Subscription schedule phase has no ${label} item`,
      BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID,
      {
        userFriendlyMessage: msg`Your billing subscription is corrupted. Please contact support.`,
      },
    );
  };

  assertPhaseHolds(BillingProductKey.BASE_PRODUCT, 'base product');
  assertPhaseHolds(BillingProductKey.RESOURCE_CREDIT, 'resource credit');

  return {
    start_date: startDate,
    ...(isDefined(endDate) ? { end_date: endDate } : {}),
    proration_behavior: 'none',
    items: currentItems.map((item, index) => {
      const managedPrice = resolveManagedItemPrice({
        productKey: resolvedProductKeys[index],
        toUpdatePrices,
      });

      return managedPrice ?? item;
    }),
  };
};
