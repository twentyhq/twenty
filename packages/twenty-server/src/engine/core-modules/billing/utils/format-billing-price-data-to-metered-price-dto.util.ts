import { BillingPriceMeteredDTO } from 'src/engine/core-modules/billing/dtos/billing-price-metered.dto';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export const formatBillingPriceDataToMeteredPriceDTO = (
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
  };
};
