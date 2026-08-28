import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { collectDueRecurringCharges } from 'src/engine/core-modules/billing/app-billing/utils/collect-due-recurring-charges.util';
import { buildRecurringChargeKey } from 'src/engine/core-modules/usage/utils/build-recurring-charge-key.util';

const APPLICATION_ID = '20202020-1111-0000-0000-000000000001';

const buildFlatApplicationMaps = (
  applications: Array<Partial<FlatApplication> & { id: string }>,
): FlatApplicationCacheMaps => ({
  byId: Object.fromEntries(
    applications.map((application) => [
      application.id,
      application as FlatApplication,
    ]),
  ),
  idByUniversalIdentifier: {},
});

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

describe('collectDueRecurringCharges', () => {
  it('should collect every declared recurring charge when none is charged yet', () => {
    const result = collectDueRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([
        {
          id: APPLICATION_ID,
          billing: { recurring: { platformFee: PLATFORM_FEE, seat: SEAT_FEE } },
        },
      ]),
      alreadyChargedKeys: new Set(),
    });

    expect(result).toEqual([
      {
        applicationId: APPLICATION_ID,
        chargeKey: 'platformFee',
        charge: PLATFORM_FEE,
      },
      { applicationId: APPLICATION_ID, chargeKey: 'seat', charge: SEAT_FEE },
    ]);
  });

  it('should skip a charge the period already carries', () => {
    const result = collectDueRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([
        {
          id: APPLICATION_ID,
          billing: { recurring: { platformFee: PLATFORM_FEE, seat: SEAT_FEE } },
        },
      ]),
      alreadyChargedKeys: new Set([
        buildRecurringChargeKey({
          applicationId: APPLICATION_ID,
          chargeKey: 'platformFee',
        }),
      ]),
    });

    expect(result).toEqual([
      { applicationId: APPLICATION_ID, chargeKey: 'seat', charge: SEAT_FEE },
    ]);
  });

  it('should key already-charged per application, not per charge name alone', () => {
    const otherApplicationId = '20202020-1111-0000-0000-000000000002';

    const result = collectDueRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([
        { id: APPLICATION_ID, billing: { recurring: { seat: SEAT_FEE } } },
        { id: otherApplicationId, billing: { recurring: { seat: SEAT_FEE } } },
      ]),
      alreadyChargedKeys: new Set([
        buildRecurringChargeKey({
          applicationId: APPLICATION_ID,
          chargeKey: 'seat',
        }),
      ]),
    });

    expect(result).toEqual([
      {
        applicationId: otherApplicationId,
        chargeKey: 'seat',
        charge: SEAT_FEE,
      },
    ]);
  });

  it('should skip an uninstalled application', () => {
    const result = collectDueRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([
        {
          id: APPLICATION_ID,
          deletedAt: new Date('2026-08-01T00:00:00.000Z'),
          billing: { recurring: { platformFee: PLATFORM_FEE } },
        },
      ]),
      alreadyChargedKeys: new Set(),
    });

    expect(result).toEqual([]);
  });

  it('should skip an application declaring only billable operations', () => {
    const result = collectDueRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([
        {
          id: APPLICATION_ID,
          billing: {
            operations: {
              recordMeeting: {
                operationType: 'CALL_RECORDING',
                label: 'Meeting recording',
              },
            },
          },
        },
      ]),
      alreadyChargedKeys: new Set(),
    });

    expect(result).toEqual([]);
  });

  // billing is hidden from TypeORM until its upgrade has run.
  it('should treat a missing billing column as no declarations', () => {
    const result = collectDueRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([{ id: APPLICATION_ID }]),
      alreadyChargedKeys: new Set(),
    });

    expect(result).toEqual([]);
  });
});
