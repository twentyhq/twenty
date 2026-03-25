/* @license Enterprise */

import type Stripe from 'stripe';

import { BillingPriceBillingScheme } from 'src/engine/core-modules/billing/enums/billing-price-billing-scheme.enum';
import { BillingPriceTaxBehavior } from 'src/engine/core-modules/billing/enums/billing-price-tax-behavior.enum';
import { BillingPriceType } from 'src/engine/core-modules/billing/enums/billing-price-type.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

export const transformStripePriceToDatabasePrice = (data: Stripe.Price) => {
  return {
    stripePriceId: data.id,
    active: data.active,
    stripeProductId: String(data.product),
    stripeMeterId: data.recurring?.meter,
    currency: data.currency.toUpperCase(),
    nickname: data.nickname === null ? undefined : data.nickname,
    taxBehavior: data.tax_behavior
      ? getTaxBehavior(data.tax_behavior)
      : undefined,
    type: getBillingPriceType(data.type),
    billingScheme: getBillingPriceBillingScheme(data.billing_scheme),
    unitAmountDecimal:
      data.unit_amount_decimal === null ? undefined : data.unit_amount_decimal,
    unitAmount: data.unit_amount ? Number(data.unit_amount) : undefined,
    transformQuantity:
      data.transform_quantity === null ? undefined : data.transform_quantity,
    usageType: data.recurring?.usage_type
      ? getBillingPriceUsageType(data.recurring.usage_type)
      : undefined,
    interval: data.recurring?.interval
      ? getBillingPriceInterval(data.recurring.interval)
      : undefined,
    currencyOptions:
      data.currency_options === null ? undefined : data.currency_options,
    tiers: data.tiers === null ? undefined : data.tiers,
    recurring: data.recurring === null ? undefined : data.recurring,
  };
};

const getTaxBehavior = (data: Stripe.Price.TaxBehavior) => {
  switch (data) {
    case 'exclusive':
      return BillingPriceTaxBehavior.EXCLUSIVE;
    case 'inclusive':
      return BillingPriceTaxBehavior.INCLUSIVE;
    case 'unspecified':
      return BillingPriceTaxBehavior.UNSPECIFIED;
  }
};

const getBillingPriceType = (data: Stripe.Price.Type) => {
  switch (data) {
    case 'one_time':
      return BillingPriceType.ONE_TIME;
    case 'recurring':
      return BillingPriceType.RECURRING;
  }
};

const getBillingPriceBillingScheme = (data: Stripe.Price.BillingScheme) => {
  switch (data) {
    case 'per_unit':
      return BillingPriceBillingScheme.PER_UNIT;
    case 'tiered':
      return BillingPriceBillingScheme.TIERED;
  }
};

const getBillingPriceUsageType = (data: Stripe.Price.Recurring.UsageType) => {
  switch (data) {
    case 'licensed':
      return BillingUsageType.LICENSED;
    case 'metered':
      return BillingUsageType.METERED;
  }
};

const getBillingPriceInterval = (data: Stripe.Price.Recurring.Interval) => {
  switch (data) {
    case 'month':
      return SubscriptionInterval.Month;
    case 'year':
      return SubscriptionInterval.Year;
  }
};
