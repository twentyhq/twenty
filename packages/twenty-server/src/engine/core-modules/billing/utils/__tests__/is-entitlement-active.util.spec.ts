import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { isEntitlementActive } from 'src/engine/core-modules/billing/utils/is-entitlement-active.util';

describe('isEntitlementActive', () => {
  it('is false without a valid Organization license, whatever billing says', () => {
    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.SSO,
        hasValidEnterprisePlan: false,
        isBillingEnabled: false,
        stripeEntitlementValue: true,
      }),
    ).toBe(false);
  });

  it('is true on a licensed instance with billing disabled (self-host)', () => {
    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.SSO,
        hasValidEnterprisePlan: true,
        isBillingEnabled: false,
        stripeEntitlementValue: false,
      }),
    ).toBe(true);
  });

  it('follows the Stripe entitlement value when licensed and billing is enabled (cloud)', () => {
    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.SSO,
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
        stripeEntitlementValue: true,
      }),
    ).toBe(true);

    expect(
      isEntitlementActive({
        key: BillingEntitlementKey.SSO,
        hasValidEnterprisePlan: true,
        isBillingEnabled: true,
        stripeEntitlementValue: false,
      }),
    ).toBe(false);
  });

  describe('a Stripe-only key', () => {
    const key = BillingEntitlementKey.INCLUDED_FAST_MODEL;

    it.each([true, false])(
      'is false with billing disabled, even with a valid license (%s) and a stale Stripe value',
      (hasValidEnterprisePlan) => {
        expect(
          isEntitlementActive({
            key,
            hasValidEnterprisePlan,
            isBillingEnabled: false,
            stripeEntitlementValue: true,
          }),
        ).toBe(false);
      },
    );

    it.each([true, false])(
      'follows the Stripe entitlement value with billing enabled, whatever the license (%s)',
      (hasValidEnterprisePlan) => {
        expect(
          isEntitlementActive({
            key,
            hasValidEnterprisePlan,
            isBillingEnabled: true,
            stripeEntitlementValue: true,
          }),
        ).toBe(true);

        expect(
          isEntitlementActive({
            key,
            hasValidEnterprisePlan,
            isBillingEnabled: true,
            stripeEntitlementValue: false,
          }),
        ).toBe(false);
      },
    );
  });
});
