/* @license Enterprise */

import { type BillingPlanDTO } from 'src/engine/core-modules/billing/dtos/billing-plan.dto';
import { type BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { type BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';

// V2 formatter: all products (including RESOURCE_CREDIT) appear in licensedProducts.
// meteredProducts is always [] — this is the signal the frontend uses to detect V2.
// After removing v1 code paths, we should discriminate product by ResourceCredit or BaseProduct and remove BillingUsageType.
export const formatBillingDatabaseProductToGraphqlDtoV2 = (
  plan: BillingGetPlanResult,
): BillingPlanDTO => {
  const allProducts = [...plan.licensedProducts, ...plan.meteredProducts];

  return {
    planKey: plan.planKey,
    licensedProducts: allProducts.map((product) => ({
      ...product,
      prices: product.billingPrices.map(
        formatBillingDatabasePriceToLicensedPriceDtoV2,
      ),
    })),
    meteredProducts: [],
  };
};

const formatBillingDatabasePriceToLicensedPriceDtoV2 = (
  billingPrice: BillingPriceEntity,
): BillingPriceLicensedDTO => {
  const rawCreditAmount = billingPrice?.metadata?.credit_amount;

  return {
    recurringInterval: billingPrice?.interval ?? SubscriptionInterval.Month,
    unitAmount: billingPrice?.unitAmount ?? 0,
    stripePriceId: billingPrice?.stripePriceId,
    priceUsageType: BillingUsageType.LICENSED,
    creditAmount: rawCreditAmount ? Number(rawCreditAmount) : null,
  };
};
