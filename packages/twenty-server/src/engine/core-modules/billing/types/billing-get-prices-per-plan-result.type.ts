/* @license Enterprise */

import { type BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export type BillingGetPricesPerPlanResult = {
  baseProductPrice: BillingPrice;
  meteredProductsPrices: BillingPrice[];
  otherLicensedProductsPrices: BillingPrice[];
};
