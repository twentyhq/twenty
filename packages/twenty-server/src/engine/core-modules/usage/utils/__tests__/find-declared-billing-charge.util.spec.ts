import { findDeclaredBillingCharge } from 'src/engine/core-modules/usage/utils/find-declared-billing-charge.util';

const BILLING = {
  recurring: {
    platformFee: {
      period: 'MONTH' as const,
      amountMicroCredits: 1_000_000,
      label: 'Platform fee',
    },
  },
  operations: {
    enrichPerson: { label: 'Person enrichment', icon: 'IconUserSearch' },
  },
};

describe('findDeclaredBillingCharge', () => {
  it('should resolve a declared operation with its icon', () => {
    expect(
      findDeclaredBillingCharge({
        billing: BILLING,
        chargeName: 'enrichPerson',
      }),
    ).toEqual({ label: 'Person enrichment', icon: 'IconUserSearch' });
  });

  it('should resolve a declared recurring charge', () => {
    expect(
      findDeclaredBillingCharge({
        billing: BILLING,
        chargeName: 'platformFee',
      })?.label,
    ).toBe('Platform fee');
  });

  it('should return undefined for an undeclared or inherited name', () => {
    expect(
      findDeclaredBillingCharge({
        billing: BILLING,
        chargeName: 'run-42',
      }),
    ).toBeUndefined();
    expect(
      findDeclaredBillingCharge({
        billing: BILLING,
        chargeName: 'constructor',
      }),
    ).toBeUndefined();
  });

  it('should return undefined without billing', () => {
    expect(
      findDeclaredBillingCharge({ billing: null, chargeName: 'any' }),
    ).toBeUndefined();
  });
});
