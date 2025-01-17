import { BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export const formatBillingPriceDataToLicensedPriceDTO = (
  billingPrice: BillingPrice,
): BillingPriceLicensedDTO => {
  return {
    recurringInterval: billingPrice?.interval ?? SubscriptionInterval.Month,
    unitAmount: billingPrice?.unitAmount ?? 0,
    stripePriceId: billingPrice?.stripePriceId,
  };
};
