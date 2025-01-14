import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

export const AVAILABLE_PRODUCT_TO_PLANS_MAP = {
  [AvailableProduct.BasePlan]: {
    planKey: BillingPlanKey.PRO,
    priceUsageBased: BillingUsageType.LICENSED,
  },
};
