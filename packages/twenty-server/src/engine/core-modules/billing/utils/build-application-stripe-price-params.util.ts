/* @license Enterprise */

import { type ApplicationBillingPrice } from 'twenty-shared/application';

import type Stripe from 'stripe';

import { DEFAULT_APPLICATION_PRICE_CURRENCY } from 'src/engine/core-modules/billing/constants/default-application-price-currency.constant';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export const buildApplicationStripePriceParams = ({
  stripeProductId,
  price,
  interval,
}: {
  stripeProductId: string;
  price: Pick<ApplicationBillingPrice, 'amountCents'>;
  interval: SubscriptionInterval;
}): Stripe.PriceCreateParams => ({
  product: stripeProductId,
  currency: DEFAULT_APPLICATION_PRICE_CURRENCY.toLowerCase(),
  unit_amount:
    interval === SubscriptionInterval.Year
      ? price.amountCents * 12
      : price.amountCents,
  recurring: { interval },
});
