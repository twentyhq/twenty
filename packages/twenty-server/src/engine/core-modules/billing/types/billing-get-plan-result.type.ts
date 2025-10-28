/* @license Enterprise */

import { type BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export type BillingGetPlanResult = {
  planKey: BillingPlanKey;
  meteredProducts: BillingProductEntity[];
  licensedProducts: BillingProductEntity[];
};
