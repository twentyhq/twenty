/* @license Enterprise */

import { createHash } from 'crypto';

import { type ApplicationBillingPrice } from 'twenty-shared/application';

import { DEFAULT_APPLICATION_PRICE_CURRENCY } from 'src/engine/core-modules/billing/constants/default-application-price-currency.constant';

export const buildApplicationStripeProductId = ({
  applicationUniversalIdentifier,
  price,
}: {
  applicationUniversalIdentifier: string;
  price: Pick<ApplicationBillingPrice, 'universalIdentifier' | 'amountCents'>;
}): string =>
  `app_price_${createHash('sha256')
    .update(
      [
        applicationUniversalIdentifier,
        price.universalIdentifier,
        price.amountCents,
        DEFAULT_APPLICATION_PRICE_CURRENCY,
      ].join(':'),
    )
    .digest('hex')
    .slice(0, 32)}`;
