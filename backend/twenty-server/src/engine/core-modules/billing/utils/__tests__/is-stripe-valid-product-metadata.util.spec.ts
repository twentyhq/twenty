/* @license Enterprise */

import type Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { isStripeValidProductMetadata } from 'src/engine/core-modules/billing/utils/is-stripe-valid-product-metadata.util';
describe('isStripeValidProductMetadata', () => {
  it('should return true if metadata is empty', () => {
    const metadata: Stripe.Metadata = {};

    expect(isStripeValidProductMetadata(metadata)).toBe(true);
  });
  it('should return true if metadata has the correct keys with correct values', () => {
    const metadata: Stripe.Metadata = {
      planKey: BillingPlanKey.PRO,
      priceUsageBased: BillingUsageType.METERED,
      productKey: BillingProductKey.BASE_PRODUCT,
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(true);
  });

  it('should return true if metadata has extra keys', () => {
    const metadata: Stripe.Metadata = {
      planKey: BillingPlanKey.ENTERPRISE,
      priceUsageBased: BillingUsageType.METERED,
      productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
      randomKey: 'randomValue',
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(true);
  });

  it('should return false if metadata has invalid keys', () => {
    const metadata: Stripe.Metadata = {
      planKey: 'invalid',
      priceUsageBased: BillingUsageType.METERED,
      productKey: 'invalid',
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(false);
  });

  it('should return false if metadata has invalid values', () => {
    const metadata: Stripe.Metadata = {
      planKey: BillingPlanKey.PRO,
      priceUsageBased: 'invalid',
      productKey: BillingProductKey.BASE_PRODUCT,
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(false);
  });

  it('should return false if the metadata does not have the required keys', () => {
    const metadata: Stripe.Metadata = {
      randomKey: 'randomValue',
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(false);
  });
});
