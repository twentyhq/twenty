/* @license Enterprise */

import { BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { BillingPriceMeteredDTO } from 'src/engine/core-modules/billing/dtos/billing-price-metered.dto';
import { BillingPlanOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-plan.output';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';

export const formatBillingDatabaseProductToGraphqlDTO = (
  plan: BillingGetPlanResult,
): BillingPlanOutput => {
  return {
    planKey: plan.planKey,
    baseProduct: {
      ...plan.baseProduct,
      metadata: {
        ...plan.baseProduct.metadata,
        priceUsageBased: BillingUsageType.LICENSED,
      },
      prices: plan.baseProduct.billingPrices.map(
        formatBillingDatabasePriceToLicensedPriceDTO,
      ),
    },
    otherLicensedProducts: plan.otherLicensedProducts.map((product) => {
      return {
        ...product,
        metadata: {
          ...product.metadata,
          priceUsageBased: BillingUsageType.LICENSED,
        },
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
  billingPrice: BillingPrice,
): BillingPriceMeteredDTO => {
  return {
    tiersMode:
      billingPrice?.tiersMode === BillingPriceTiersMode.GRADUATED
        ? BillingPriceTiersMode.GRADUATED
        : null,
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
  billingPrice: BillingPrice,
): BillingPriceLicensedDTO => {
  return {
    recurringInterval: billingPrice?.interval ?? SubscriptionInterval.Month,
    unitAmount: billingPrice?.unitAmount ?? 0,
    stripePriceId: billingPrice?.stripePriceId,
    priceUsageType: BillingUsageType.LICENSED,
  };
};
