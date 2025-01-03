import Stripe from 'stripe';

import { BillingPriceBillingScheme } from 'src/engine/core-modules/billing/enums/billing-price-billing-scheme.enum';
import { BillingPriceTaxBehavior } from 'src/engine/core-modules/billing/enums/billing-price-tax-behavior.enum';
import { BillingPriceTiersMode } from 'src/engine/core-modules/billing/enums/billing-price-tiers-mode.enum';
import { BillingPriceType } from 'src/engine/core-modules/billing/enums/billing-price-type.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

export const transformStripePriceEventToPriceRepositoryData = (
  data: Stripe.PriceCreatedEvent.Data | Stripe.PriceUpdatedEvent.Data,
) => {
  return {
    stripePriceId: data.object.id,
    active: data.object.active,
    stripeProductId: String(data.object.product),
    stripeMeterId: data.object.recurring?.meter,
    currency: data.object.currency.toUpperCase(),
    nickname: data.object.nickname === null ? undefined : data.object.nickname,
    taxBehavior: data.object.tax_behavior
      ? getTaxBehavior(data.object.tax_behavior)
      : undefined,
    type: getBillingPriceType(data.object.type),
    billingScheme: getBillingPriceBillingScheme(data.object.billing_scheme),
    unitAmountDecimal:
      data.object.unit_amount_decimal === null
        ? undefined
        : data.object.unit_amount_decimal,
    unitAmount: data.object.unit_amount
      ? Number(data.object.unit_amount)
      : undefined,
    transformQuantity:
      data.object.transform_quantity === null
        ? undefined
        : data.object.transform_quantity,
    usageType: data.object.recurring?.usage_type
      ? getBillingPriceUsageType(data.object.recurring.usage_type)
      : undefined,
    interval: data.object.recurring?.interval
      ? getBillingPriceInterval(data.object.recurring.interval)
      : undefined,
    currencyOptions:
      data.object.currency_options === null
        ? undefined
        : data.object.currency_options,
    tiers: data.object.tiers === null ? undefined : data.object.tiers,
    tiersMode: data.object.tiers_mode
      ? getBillingPriceTiersMode(data.object.tiers_mode)
      : undefined,
    recurring:
      data.object.recurring === null ? undefined : data.object.recurring,
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

const getBillingPriceTiersMode = (data: Stripe.Price.TiersMode) => {
  switch (data) {
    case 'graduated':
      return BillingPriceTiersMode.GRADUATED;
    case 'volume':
      return BillingPriceTiersMode.VOLUME;
  }
};

const getBillingPriceInterval = (data: Stripe.Price.Recurring.Interval) => {
  switch (data) {
    case 'month':
      return SubscriptionInterval.Month;
    case 'day':
      return SubscriptionInterval.Day;
    case 'week':
      return SubscriptionInterval.Week;
    case 'year':
      return SubscriptionInterval.Year;
  }
};
