/* @license Enterprise */

import { type BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export type BillingGetPricesPerPlanResult = {
  meteredProductsPrices: BillingPrice[];
  licensedProductsPrices: BillingPrice[];
};
