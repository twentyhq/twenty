import { isDefined } from 'twenty-shared/utils';

import { type BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type MeterBillingPriceTiers } from 'src/engine/core-modules/billing/types/meter-billing-price-tier.type';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { type BillingMeterPrice } from 'src/engine/core-modules/billing/types/billing-meter-price.type';
import { type BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import {
  type LicensedBillingSubscriptionItem,
  type MeteredBillingSubscriptionItem,
} from 'src/engine/core-modules/billing/types/billing-subscription-item.type';
import { type BillingSubscriptionWithSubscriptionItems } from 'src/engine/core-modules/billing/types/billing-subscription-with-subscription-items';

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
): asserts price is BillingMeterPrice => {
  if (
    price.billingProduct?.metadata.priceUsageBased !== BillingUsageType.METERED
  ) {
    throw new BillingException(
      'Price is not a metered price',
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }

  if (!isMeteredTiersSchema(price.tiers)) {
    throw new BillingException(
      'Tiers declare in price do not match metered price schema. Price must have exactly two tiers and only one must have a defined limitation (up_to). Example: [{up_to: 100}, {up_to: null}]',
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }

  return;
};

const isMeteredPrice = (price: BillingPrice): price is BillingMeterPrice => {
  if (
    price.billingProduct?.metadata.priceUsageBased !==
      BillingUsageType.METERED ||
    !isMeteredTiersSchema(price.tiers)
  ) {
    return false;
  }

  return true;
};

const assertIsSubscription = (
  subscription: BillingSubscription | undefined,
): asserts subscription is BillingSubscription &
  BillingSubscriptionWithSubscriptionItems => {
  if (!isDefined(subscription)) {
    throw new BillingException(
      'Subscription is not defined',
      BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
    );
  }
  if (!isDefined(subscription.billingSubscriptionItems)) {
    throw new BillingException(
      'Subscription items is not defined. Check the relation in the query',
      BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
    );
  }

  if (subscription.billingSubscriptionItems.length !== 2) {
    throw new BillingException(
      'Subscription must have exactly two subscription items. Check that stripe and database are in sync',
      BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID,
      {
        userFriendlyMessage:
          'Your billing subscription is corrupted. Please contact support.',
      },
    );
  }

  return;
};

export const billingValidator: {
  assertIsMeteredTiersSchemaOrThrow: typeof assertIsMeteredTiersSchemaOrThrow;
  isMeteredTiersSchema: typeof isMeteredTiersSchema;
  assertIsLicensedSubscriptionItem: typeof assertIsLicensedSubscriptionItem;
  assertIsMeteredSubscriptionItem: typeof assertIsMeteredSubscriptionItem;
  assertIsMeteredPrice: typeof assertIsMeteredPrice;
  assertIsSubscription: typeof assertIsSubscription;
  isMeteredPrice: typeof isMeteredPrice;
} = {
  assertIsMeteredTiersSchemaOrThrow,
  isMeteredTiersSchema,
  assertIsLicensedSubscriptionItem,
  assertIsMeteredSubscriptionItem,
  assertIsMeteredPrice,
  assertIsSubscription,
  isMeteredPrice,
};
