import { type DeclaredRecurringCharge } from 'src/engine/core-modules/billing/app-billing/utils/collect-declared-recurring-charges.util';
import { collectDueRecurringCharges } from 'src/engine/core-modules/billing/app-billing/utils/collect-due-recurring-charges.util';
import { buildRecurringChargeKey } from 'src/engine/core-modules/usage/utils/build-recurring-charge-key.util';

const APPLICATION_ID = '20202020-1111-0000-0000-000000000001';
const OTHER_APPLICATION_ID = '20202020-1111-0000-0000-000000000002';

const PLATFORM_FEE = {
  period: 'MONTH',
  amountMicroCredits: 20_000_000,
  label: 'Platform fee',
} as const;

const SEAT_FEE = {
  period: 'MONTH',
  amountMicroCredits: 5_000_000,
  per: 'WORKSPACE_MEMBER',
  label: 'Per member',
} as const;

const PLATFORM_FEE_CHARGE: DeclaredRecurringCharge = {
  applicationId: APPLICATION_ID,
  chargeKey: 'platformFee',
  charge: PLATFORM_FEE,
};

const SEAT_CHARGE: DeclaredRecurringCharge = {
  applicationId: APPLICATION_ID,
  chargeKey: 'seat',
  charge: SEAT_FEE,
};

const OTHER_SEAT_CHARGE: DeclaredRecurringCharge = {
  applicationId: OTHER_APPLICATION_ID,
  chargeKey: 'seat',
  charge: SEAT_FEE,
};

describe('collectDueRecurringCharges', () => {
  it('should keep every declared charge when none is charged yet', () => {
    const result = collectDueRecurringCharges({
      declaredCharges: [PLATFORM_FEE_CHARGE, SEAT_CHARGE],
      alreadyChargedKeys: new Set(),
    });

    expect(result).toEqual([PLATFORM_FEE_CHARGE, SEAT_CHARGE]);
  });

  it('should skip a charge the period already carries', () => {
    const result = collectDueRecurringCharges({
      declaredCharges: [PLATFORM_FEE_CHARGE, SEAT_CHARGE],
      alreadyChargedKeys: new Set([
        buildRecurringChargeKey({
          applicationId: APPLICATION_ID,
          chargeKey: 'platformFee',
        }),
      ]),
    });

    expect(result).toEqual([SEAT_CHARGE]);
  });

  it('should key already-charged per application, not per charge name alone', () => {
    const result = collectDueRecurringCharges({
      declaredCharges: [SEAT_CHARGE, OTHER_SEAT_CHARGE],
      alreadyChargedKeys: new Set([
        buildRecurringChargeKey({
          applicationId: APPLICATION_ID,
          chargeKey: 'seat',
        }),
      ]),
    });

    expect(result).toEqual([OTHER_SEAT_CHARGE]);
  });

  it('should return nothing when the period already carries every charge', () => {
    const result = collectDueRecurringCharges({
      declaredCharges: [PLATFORM_FEE_CHARGE, SEAT_CHARGE],
      alreadyChargedKeys: new Set([
        buildRecurringChargeKey({
          applicationId: APPLICATION_ID,
          chargeKey: 'platformFee',
        }),
        buildRecurringChargeKey({
          applicationId: APPLICATION_ID,
          chargeKey: 'seat',
        }),
      ]),
    });

    expect(result).toEqual([]);
  });

  it('should return nothing when nothing is declared', () => {
    const result = collectDueRecurringCharges({
      declaredCharges: [],
      alreadyChargedKeys: new Set(),
    });

    expect(result).toEqual([]);
  });
});
