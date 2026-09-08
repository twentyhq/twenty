import { isEntitlementActive } from 'src/engine/core-modules/billing/utils/is-entitlement-active.util';

describe('isEntitlementActive', () => {
  it('is false without a valid Organization license, whatever billing says', () => {
    expect(
      isEntitlementActive({
        hasValidEnterprisePlan: false,
        isBillingEnabled: false,
        stripeEntitlementValue: true,
      }),
    ).toBe(false);
  });

  it('is true on a licensed instance with billing disabled (self-host)', () => {
    expect(
      isEntitlementActive({
        hasValidEnterprisePlan: true,
        isBillingEnabled: false,
        stripeEntitlementValue: false,
      }),
    ).toBe(true);
  });

  it('follows the Stripe entitlement value when licensed and billing is enabled (cloud)', () => {
    expect(
      isEntitlementActive({
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
        stripeEntitlementValue: true,
      }),
    ).toBe(true);

    expect(
      isEntitlementActive({
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
        stripeEntitlementValue: false,
      }),
    ).toBe(false);
  });
});
