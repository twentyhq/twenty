/* @license Enterprise */

import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export type BillingGetPlanResult = {
  planKey: BillingPlanKey;
  baseProduct: BillingProduct;
  meteredProducts: BillingProduct[];
  otherLicensedProducts: BillingProduct[];
};
