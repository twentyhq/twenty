import { isDefined } from 'twenty-shared/utils';

import { isNumber } from 'class-validator';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { type BillingMeterPrice } from 'src/engine/core-modules/billing/types/billing-meter-price.type';
import { type MeterBillingPriceTiers } from 'src/engine/core-modules/billing/types/meter-billing-price-tier.type';

const assertIsMeteredTiersSchemaOrThrow = (
  tiers: BillingPriceEntity['tiers'] | undefined | null,
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
  tiers: BillingPriceEntity['tiers'] | undefined | null,
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

const assertIsMeteredPrice = (
  price: BillingPriceEntity,
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

const isMeteredPrice = (
  price: BillingPriceEntity,
): price is BillingMeterPrice => {
  if (
    price.billingProduct?.metadata.priceUsageBased !==
      BillingUsageType.METERED ||
    !isMeteredTiersSchema(price.tiers)
  ) {
    return false;
  }

  return true;
};

// V2 validators — do not throw for V1 items; only used on V2 code paths

const isLicensedResourceCreditItem = (
  subscriptionItem: BillingSubscriptionItemEntity,
): boolean => {
  return (
    subscriptionItem.billingProduct?.metadata?.productKey ===
    BillingProductKey.RESOURCE_CREDIT
  );
};

const assertIsLicensedResourceCreditPrice = (
  price: BillingPriceEntity,
): void => {
  if (
    price.billingProduct?.metadata?.productKey !==
    BillingProductKey.RESOURCE_CREDIT
  ) {
    throw new BillingException(
      'Price is not a RESOURCE_CREDIT licensed price',
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }

  const creditAmount = price.metadata?.credit_amount;

  if (!isDefined(creditAmount) || !isNumber(Number(creditAmount))) {
    throw new BillingException(
      'RESOURCE_CREDIT price must have a credit_amount in metadata',
      BillingExceptionCode.BILLING_PRICE_INVALID,
    );
  }
};

const getCapFromCreditMetadata = (price: BillingPriceEntity): number => {
  assertIsLicensedResourceCreditPrice(price);
  return Number(price.metadata?.credit_amount);
};

export const billingValidator: {
  assertIsMeteredTiersSchemaOrThrow: typeof assertIsMeteredTiersSchemaOrThrow;
  isMeteredTiersSchema: typeof isMeteredTiersSchema;
  assertIsMeteredPrice: typeof assertIsMeteredPrice;
  isMeteredPrice: typeof isMeteredPrice;
  assertIsLicensedResourceCreditPrice: typeof assertIsLicensedResourceCreditPrice;
  isLicensedResourceCreditItem: typeof isLicensedResourceCreditItem;
  getCapFromCreditMetadata: typeof getCapFromCreditMetadata;
} = {
  assertIsMeteredTiersSchemaOrThrow,
  isMeteredTiersSchema,
  assertIsMeteredPrice,
  isMeteredPrice,
  assertIsLicensedResourceCreditPrice,
  isLicensedResourceCreditItem,
  getCapFromCreditMetadata,
};
