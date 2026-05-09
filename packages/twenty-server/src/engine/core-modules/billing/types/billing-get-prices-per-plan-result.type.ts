/* @license Enterprise */

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export type BillingGetPricesPerPlanResult = {
  meteredProductPrices: BillingPriceEntity[];
  baseProductPrices: BillingPriceEntity[];
  resourceCreditProductPrices: BillingPriceEntity[];
};
