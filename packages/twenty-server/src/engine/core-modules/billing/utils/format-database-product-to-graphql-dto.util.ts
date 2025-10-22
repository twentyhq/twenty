/* @license Enterprise */

import { type BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { type BillingPriceMeteredDTO } from 'src/engine/core-modules/billing/dtos/billing-price-metered.dto';
import { type BillingPlanOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-plan.output';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { type BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';

export const formatBillingDatabaseProductToGraphqlDTO = (
  plan: BillingGetPlanResult,
): BillingPlanOutput => {
  return {
    planKey: plan.planKey,
    licensedProducts: plan.licensedProducts.map((product) => {
      return {
        ...product,
        prices: product.billingPrices.map(
          formatBillingDatabasePriceToLicensedPriceDTO,
        ),
      };
    }),
    meteredProducts: plan.meteredProducts.map((product) => {
      return {
        ...product,
        metadata: {
          ...product.metadata,
          priceUsageBased: BillingUsageType.METERED,
        },
        prices: product.billingPrices.map(
          formatBillingDatabasePriceToMeteredPriceDTO,
        ),
      };
    }),
  };
};

const formatBillingDatabasePriceToMeteredPriceDTO = (
  billingPrice: BillingPriceEntity,
): BillingPriceMeteredDTO => {
  return {
    tiers:
      billingPrice?.tiers?.map((tier) => ({
        upTo: tier.up_to,
        flatAmount: tier.flat_amount,
        unitAmount: tier.unit_amount,
      })) ?? [],
    recurringInterval: billingPrice?.interval ?? SubscriptionInterval.Month,
    stripePriceId: billingPrice?.stripePriceId,
    priceUsageType: BillingUsageType.METERED,
  };
};

const formatBillingDatabasePriceToLicensedPriceDTO = (
  billingPrice: BillingPriceEntity,
): BillingPriceLicensedDTO => {
  return {
    recurringInterval: billingPrice?.interval ?? SubscriptionInterval.Month,
    unitAmount: billingPrice?.unitAmount ?? 0,
    stripePriceId: billingPrice?.stripePriceId,
    priceUsageType: BillingUsageType.LICENSED,
  };
};
