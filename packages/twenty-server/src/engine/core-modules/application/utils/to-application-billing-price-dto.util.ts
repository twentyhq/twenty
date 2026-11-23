import { type ApplicationBillingPrice } from 'twenty-shared/application';

import { type ApplicationBillingPriceDTO } from 'src/engine/core-modules/application/dtos/application-billing-price.dto';

export const toApplicationBillingPriceDto = (
  price: ApplicationBillingPrice,
): ApplicationBillingPriceDTO => ({
  universalIdentifier: price.universalIdentifier,
  label: price.label,
  type: price.type,
  billingPeriod: price.billingPeriod,
  amountCents: price.amountCents,
  currency: price.currency ?? 'USD',
  per: price.per ?? null,
});
