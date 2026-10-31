import { listDeclaredBillingChargeNames } from 'src/engine/core-modules/usage/utils/list-declared-billing-charge-names.util';

describe('listDeclaredBillingChargeNames', () => {
  it('should list recurring charges and operations', () => {
    expect(
      listDeclaredBillingChargeNames({
        billing: {
          recurring: {
            platformFee: {
              period: 'MONTH',
              amountMicroCredits: 1_000_000,
              label: 'Platform fee',
            },
          },
          operations: { enrichPerson: { label: 'Person enrichment' } },
        },
      }),
    ).toEqual(['platformFee', 'enrichPerson']);
  });

  it('should return an empty list without billing', () => {
    expect(listDeclaredBillingChargeNames({ billing: undefined })).toEqual([]);
  });
});
