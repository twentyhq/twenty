import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { isEntitlementActive } from 'src/engine/core-modules/billing/utils/is-entitlement-active.util';

describe('isEntitlementActive', () => {
  it('is false without a valid Organization license, whatever billing says', () => {
    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.RLS,
        hasValidEnterprisePlan: false,
        isBillingEnabled: false,
        stripeEntitlementValue: true,
      }),
    ).toBe(false);
  });

  it('is true without a license for a key granted without billing (self-host)', () => {
    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.CUSTOM_ROLES,
        hasValidEnterprisePlan: false,
        isBillingEnabled: false,
        stripeEntitlementValue: false,
      }),
    ).toBe(true);
  });

  it('follows the Stripe entitlement value for a key granted without billing when billing is enabled (cloud)', () => {
    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.CUSTOM_ROLES,
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
        stripeEntitlementValue: false,
      }),
    ).toBe(false);
  });

  it('is true on a licensed instance with billing disabled (self-host)', () => {
    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.RLS,
        hasValidEnterprisePlan: true,
        isBillingEnabled: false,
        stripeEntitlementValue: false,
      }),
    ).toBe(true);
  });

  it('follows the Stripe entitlement value when licensed and billing is enabled (cloud)', () => {
    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.RLS,
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
        stripeEntitlementValue: true,
      }),
    ).toBe(true);

    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.RLS,
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
        stripeEntitlementValue: false,
      }),
    ).toBe(false);
  });
});
