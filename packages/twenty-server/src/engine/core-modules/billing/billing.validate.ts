import { isDefined } from 'twenty-shared/utils';

import { type BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type MeterBillingPriceTiers } from 'src/engine/core-modules/billing/types/meter-billing-price-tier.type';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';

const assertIsMeteredTiersSchemaOrThrow = (
  tiers: BillingPrice['tiers'] | undefined | null,
): asserts tiers is MeterBillingPriceTiers => {
  const error = new BillingException(
    'Metered price must have exactly two tiers and only one must have a defined limitation (up_to)',
    BillingExceptionCode.BILLING_PRICE_INVALID_TIERS,
  );

  if (!isDefined(tiers)) {
    throw error;
  }

  if (
    tiers.length !== 2 ||
    typeof tiers[0].up_to !== 'number' ||
    tiers[1].up_to !== null
  ) {
    throw new BillingException(
      'Metered price must have exactly two tiers and only one must have a defined limitation (up_to)',
      BillingExceptionCode.BILLING_PRICE_INVALID_TIERS,
    );
  }

  return;
};

export const billingValidator: {
  assertIsMeteredTiersSchemaOrThrow: typeof assertIsMeteredTiersSchemaOrThrow;
} = {
  assertIsMeteredTiersSchemaOrThrow,
};
