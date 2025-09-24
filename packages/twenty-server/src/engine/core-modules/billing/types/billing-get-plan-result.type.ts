/* @license Enterprise */

import { type BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export type BillingGetPlanResult = {
  planKey: BillingPlanKey;
  meteredProducts: BillingProduct[];
  licensedProducts: BillingProduct[];
};
