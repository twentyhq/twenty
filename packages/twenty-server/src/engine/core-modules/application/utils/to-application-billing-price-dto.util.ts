import { type ApplicationBillingPrice } from 'twenty-shared/application';

import { DEFAULT_APPLICATION_PRICE_CURRENCY } from 'src/engine/core-modules/billing/constants/default-application-price-currency.constant';
import { type ApplicationBillingPriceDTO } from 'src/engine/core-modules/application/dtos/application-billing-price.dto';

export const toApplicationBillingPriceDto = (
  price: ApplicationBillingPrice,
): ApplicationBillingPriceDTO => ({
  universalIdentifier: price.universalIdentifier,
  label: price.label,
  type: price.type,
  billingPeriod: price.billingPeriod,
  amountCents: price.amountCents,
  currency: price.currency ?? DEFAULT_APPLICATION_PRICE_CURRENCY,
  per: price.per ?? null,
});
