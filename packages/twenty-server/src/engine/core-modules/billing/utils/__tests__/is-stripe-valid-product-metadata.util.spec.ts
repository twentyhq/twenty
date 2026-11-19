/* @license Enterprise */

import type Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { isStripeValidProductMetadata } from 'src/engine/core-modules/billing/utils/is-stripe-valid-product-metadata.util';
describe('isStripeValidProductMetadata', () => {
  it('should return true if metadata is empty', () => {
    const metadata: Stripe.Metadata = {};

    expect(isStripeValidProductMetadata(metadata)).toBe(true);
  });
  it('should return true if metadata has the correct keys with correct values', () => {
    const metadata: Stripe.Metadata = {
      planKey: BillingPlanKey.PRO,
      productKey: BillingProductKey.BASE_PRODUCT,
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(true);
  });

  it('should return true if metadata has extra keys', () => {
    const metadata: Stripe.Metadata = {
      planKey: BillingPlanKey.ENTERPRISE,
      priceUsageBased: 'LICENSED',
      productKey: BillingProductKey.RESOURCE_CREDIT,
      randomKey: 'randomValue',
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(true);
  });

  it('should return true for an application product without a plan key', () => {
    const metadata: Stripe.Metadata = {
      productKey: BillingProductKey.APPLICATION,
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(true);
  });

  it('should return false for an application product with an unknown plan key', () => {
    const metadata: Stripe.Metadata = {
      planKey: 'invalid',
      productKey: BillingProductKey.APPLICATION,
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(false);
  });

  it('should return false for a base product without a plan key', () => {
    const metadata: Stripe.Metadata = {
      productKey: BillingProductKey.BASE_PRODUCT,
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(false);
  });

  it('should return false if metadata has invalid keys', () => {
    const metadata: Stripe.Metadata = {
      planKey: 'invalid',
      productKey: 'invalid',
    };

    expect(isStripeValidProductMetadata(metadata)).toBe(false);
  });

  it('should return false if metadata has invalid values', () => {
    const metadata: Stripe.Metadata = {
      planKey: BillingPlanKey.PRO,
      productKey: 'invalid',
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
