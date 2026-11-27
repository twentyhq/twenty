import { isDefined } from 'twenty-shared/utils';

import { isNumber } from 'class-validator';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

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
  assertIsLicensedResourceCreditPrice: typeof assertIsLicensedResourceCreditPrice;
  isLicensedResourceCreditItem: typeof isLicensedResourceCreditItem;
  getCapFromCreditMetadata: typeof getCapFromCreditMetadata;
} = {
  assertIsLicensedResourceCreditPrice,
  isLicensedResourceCreditItem,
  getCapFromCreditMetadata,
};
