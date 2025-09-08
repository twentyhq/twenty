import { isDefined } from 'twenty-shared/utils';

import { type BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type MeterBillingPriceTiers } from 'src/engine/core-modules/billing/types/meter-billing-price-tier.type';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import {
  type BillingSubscriptionItem,
  type LicensedBillingSubscriptionItem,
  type MeteredBillingSubscriptionItem,
} from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

const assertIsMeteredTiersSchemaOrThrow = (
  tiers: BillingPrice['tiers'] | undefined | null,
): asserts tiers is MeterBillingPriceTiers => {
  const error = new BillingException(
    'Metered price must have exactly two tiers and only one must have a defined limitation (up_to)',
    BillingExceptionCode.BILLING_PRICE_INVALID_TIERS,
  );

  if (!isMeteredTiersSchema(tiers)) {
    throw error;
  }

  return;
};

const isMeteredTiersSchema = (
  tiers: BillingPrice['tiers'] | undefined | null,
): tiers is MeterBillingPriceTiers => {
  if (!isDefined(tiers)) {
    return false;
  }

  if (
    tiers.length !== 2 ||
    typeof tiers[0].up_to !== 'number' ||
    tiers[1].up_to !== null
  ) {
    return false;
  }

  return true;
};

const assertIsLicensedSubscriptionItem = (
  subscriptionItem: BillingSubscriptionItem,
): asserts subscriptionItem is LicensedBillingSubscriptionItem => {
  if (
    subscriptionItem.quantity !== null &&
    subscriptionItem.billingProduct.metadata.priceUsageBased ===
      BillingUsageType.LICENSED
  )
    return;

  throw new BillingException(
    'Subscription Item is not a licence subscription item',
    BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_INVALID,
  );
};

const assertIsMeteredSubscriptionItem = (
  subscriptionItem: BillingSubscriptionItem,
): asserts subscriptionItem is MeteredBillingSubscriptionItem => {
  if (
    subscriptionItem.quantity === null &&
    subscriptionItem.billingProduct.metadata.priceUsageBased ===
      BillingUsageType.METERED
  )
    return;

  throw new BillingException(
    'Subscription Item is not a meter subscription item',
    BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_INVALID,
  );
};

const assertIsMeteredPrice = (
  price: BillingPrice,
): asserts price is BillingPrice => {
  if (
    price.billingProduct.metadata.priceUsageBased === BillingUsageType.METERED
  )
    return;

  throw new BillingException(
    'Price is not metered',
    BillingExceptionCode.BILLING_PRICE_INVALID,
  );
};

export const billingValidator: {
  assertIsMeteredTiersSchemaOrThrow: typeof assertIsMeteredTiersSchemaOrThrow;
  isMeteredTiersSchema: typeof isMeteredTiersSchema;
  assertIsLicensedSubscriptionItem: typeof assertIsLicensedSubscriptionItem;
  assertIsMeteredSubscriptionItem: typeof assertIsMeteredSubscriptionItem;
  assertIsMeteredPrice: typeof assertIsMeteredPrice;
} = {
  assertIsMeteredTiersSchemaOrThrow,
  isMeteredTiersSchema,
  assertIsLicensedSubscriptionItem,
  assertIsMeteredSubscriptionItem,
  assertIsMeteredPrice,
};
