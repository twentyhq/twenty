/* @license Enterprise */

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export type BillingGetPricesPerPlanResult = {
  meteredProductsPrices: BillingPriceEntity[];
  licensedProductsPrices: BillingPriceEntity[];
};
