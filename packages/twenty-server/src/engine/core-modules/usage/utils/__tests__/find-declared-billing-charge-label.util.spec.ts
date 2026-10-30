import { findDeclaredBillingChargeLabel } from 'src/engine/core-modules/usage/utils/find-declared-billing-charge-label.util';

const BILLING = {
  recurring: {
    platformFee: {
      period: 'MONTH' as const,
      amountMicroCredits: 1_000_000,
      label: 'Platform fee',
    },
  },
  operations: { enrichPerson: { label: 'Person enrichment' } },
};

describe('findDeclaredBillingChargeLabel', () => {
  it('should resolve a declared operation label', () => {
    expect(
      findDeclaredBillingChargeLabel({
        billing: BILLING,
        chargeName: 'enrichPerson',
      }),
    ).toBe('Person enrichment');
  });

  it('should resolve a declared recurring charge label', () => {
    expect(
      findDeclaredBillingChargeLabel({
        billing: BILLING,
        chargeName: 'platformFee',
      }),
    ).toBe('Platform fee');
  });

  it('should return undefined for an undeclared or inherited name', () => {
    expect(
      findDeclaredBillingChargeLabel({
        billing: BILLING,
        chargeName: 'run-42',
      }),
    ).toBeUndefined();
    expect(
      findDeclaredBillingChargeLabel({
        billing: BILLING,
        chargeName: 'constructor',
      }),
    ).toBeUndefined();
  });

  it('should return undefined without billing', () => {
    expect(
      findDeclaredBillingChargeLabel({ billing: null, chargeName: 'any' }),
    ).toBeUndefined();
  });
});
