import { MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT } from 'twenty-shared/application';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { collectDeclaredRecurringCharges } from 'src/engine/core-modules/billing/app-billing/utils/collect-declared-recurring-charges.util';

const APPLICATION_ID = '20202020-1111-0000-0000-000000000001';
const OTHER_APPLICATION_ID = '20202020-1111-0000-0000-000000000002';

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

// The column is jsonb, so a declaration reaching the raise path is untrusted
// whatever the RecurringCharge type claims.
const collectOne = (charge: unknown) =>
  collectDeclaredRecurringCharges({
    flatApplicationMaps: buildFlatApplicationMaps([
      { id: APPLICATION_ID, billing: { recurring: { fee: charge } } },
    ] as unknown as Array<Partial<FlatApplication> & { id: string }>),
  });

describe('collectDeclaredRecurringCharges', () => {
  it('should collect every recurring charge an installed application declares', () => {
    const { declaredCharges, rejectedCharges } =
      collectDeclaredRecurringCharges({
        flatApplicationMaps: buildFlatApplicationMaps([
          {
            id: APPLICATION_ID,
            billing: {
              recurring: { platformFee: PLATFORM_FEE, seat: SEAT_FEE },
            },
          },
        ]),
      });

    expect(declaredCharges).toEqual([
      {
        applicationId: APPLICATION_ID,
        chargeKey: 'platformFee',
        charge: PLATFORM_FEE,
      },
      { applicationId: APPLICATION_ID, chargeKey: 'seat', charge: SEAT_FEE },
    ]);
    expect(rejectedCharges).toEqual([]);
  });

  it('should collect charges from every installed application', () => {
    const { declaredCharges } = collectDeclaredRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([
        { id: APPLICATION_ID, billing: { recurring: { seat: SEAT_FEE } } },
        {
          id: OTHER_APPLICATION_ID,
          billing: { recurring: { seat: SEAT_FEE } },
        },
      ]),
    });

    expect(declaredCharges).toEqual([
      { applicationId: APPLICATION_ID, chargeKey: 'seat', charge: SEAT_FEE },
      {
        applicationId: OTHER_APPLICATION_ID,
        chargeKey: 'seat',
        charge: SEAT_FEE,
      },
    ]);
  });

  it('should skip an uninstalled application', () => {
    const { declaredCharges, rejectedCharges } =
      collectDeclaredRecurringCharges({
        flatApplicationMaps: buildFlatApplicationMaps([
          {
            id: APPLICATION_ID,
            deletedAt: new Date('2026-08-01T00:00:00.000Z'),
            billing: { recurring: { platformFee: PLATFORM_FEE } },
          },
        ]),
      });

    expect(declaredCharges).toEqual([]);
    expect(rejectedCharges).toEqual([]);
  });

  it('should skip an application declaring only billable operations', () => {
    const { declaredCharges } = collectDeclaredRecurringCharges({
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
    });

    expect(declaredCharges).toEqual([]);
  });

  // billing is hidden from TypeORM until its upgrade has run.
  it('should treat a missing billing column as no declarations', () => {
    const { declaredCharges } = collectDeclaredRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([{ id: APPLICATION_ID }]),
    });

    expect(declaredCharges).toEqual([]);
  });

  it('should return nothing when the workspace has no applications', () => {
    const { declaredCharges } = collectDeclaredRecurringCharges({
      flatApplicationMaps: buildFlatApplicationMaps([]),
    });

    expect(declaredCharges).toEqual([]);
  });

  // A negative amount would subtract from the period's usage sum, handing the
  // workspace credits rather than charging it.
  it('should reject a negative amount rather than crediting the workspace', () => {
    const { declaredCharges, rejectedCharges } = collectOne({
      ...PLATFORM_FEE,
      amountMicroCredits: -1,
    });

    expect(declaredCharges).toEqual([]);
    expect(rejectedCharges).toEqual([
      {
        applicationId: APPLICATION_ID,
        chargeKey: 'fee',
        reason: 'malformed or out-of-bounds recurring charge declaration',
      },
    ]);
  });

  it('should reject a zero amount', () => {
    const { declaredCharges, rejectedCharges } = collectOne({
      ...PLATFORM_FEE,
      amountMicroCredits: 0,
    });

    expect(declaredCharges).toEqual([]);
    expect(rejectedCharges).toEqual([
      {
        applicationId: APPLICATION_ID,
        chargeKey: 'fee',
        reason: 'malformed or out-of-bounds recurring charge declaration',
      },
    ]);
  });

  it('should reject an amount above the per-unit maximum', () => {
    const { declaredCharges, rejectedCharges } = collectOne({
      ...PLATFORM_FEE,
      amountMicroCredits: MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT + 1,
    });

    expect(declaredCharges).toEqual([]);
    expect(rejectedCharges).toEqual([
      {
        applicationId: APPLICATION_ID,
        chargeKey: 'fee',
        reason: 'malformed or out-of-bounds recurring charge declaration',
      },
    ]);
  });

  // An array is typeof 'object', so without an explicit check Object.entries
  // would bill each element under its numeric index.
  it('should ignore a recurring block that is an array rather than a map', () => {
    const { declaredCharges, rejectedCharges } =
      collectDeclaredRecurringCharges({
        flatApplicationMaps: buildFlatApplicationMaps([
          { id: APPLICATION_ID, billing: { recurring: [PLATFORM_FEE] } },
        ] as unknown as Array<Partial<FlatApplication> & { id: string }>),
      });

    expect(declaredCharges).toEqual([]);
    expect(rejectedCharges).toEqual([]);
  });

  it('should accept an amount exactly at the per-unit maximum', () => {
    const { declaredCharges } = collectOne({
      ...PLATFORM_FEE,
      amountMicroCredits: MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT,
    });

    expect(declaredCharges).toHaveLength(1);
  });

  it.each([
    ['a string amount', { ...PLATFORM_FEE, amountMicroCredits: '20' }],
    ['a fractional amount', { ...PLATFORM_FEE, amountMicroCredits: 20.5 }],
    ['a NaN amount', { ...PLATFORM_FEE, amountMicroCredits: Number.NaN }],
    [
      'an infinite amount',
      { ...PLATFORM_FEE, amountMicroCredits: Number.POSITIVE_INFINITY },
    ],
    ['a missing amount', { period: 'MONTH', label: 'Platform fee' }],
    ['an unknown period', { ...PLATFORM_FEE, period: 'YEAR' }],
    ['a missing period', { amountMicroCredits: 20_000_000, label: 'Fee' }],
    ['an unknown per unit', { ...SEAT_FEE, per: 'SEAT' }],
    ['an empty label', { ...PLATFORM_FEE, label: '   ' }],
    ['a non-string label', { ...PLATFORM_FEE, label: 42 }],
    ['a null charge', null],
    ['a non-object charge', 'platformFee'],
  ])('should reject %s', (_case, charge) => {
    const { declaredCharges, rejectedCharges } = collectOne(charge);

    expect(declaredCharges).toEqual([]);
    expect(rejectedCharges).toHaveLength(1);
  });
});
