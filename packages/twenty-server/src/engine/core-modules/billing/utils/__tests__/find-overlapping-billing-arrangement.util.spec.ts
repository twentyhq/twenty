/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type ScopedBillingArrangementPeriod } from 'src/engine/core-modules/billing/types/scoped-billing-arrangement-period.type';
import { findOverlappingBillingArrangement } from 'src/engine/core-modules/billing/utils/find-overlapping-billing-arrangement.util';

const FIRST_USAGE_LIMIT_ID = '20202020-0000-4000-8000-000000000001';
const SECOND_USAGE_LIMIT_ID = '20202020-0000-4000-8000-000000000002';

const period = (
  overrides: Partial<ScopedBillingArrangementPeriod> = {},
): ScopedBillingArrangementPeriod => ({
  type: BillingArrangementType.FREE_SEATS,
  startsAt: new Date('2026-11-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
  usageLimitId: null,
  ...overrides,
});

const limitOverride = (
  overrides: Partial<ScopedBillingArrangementPeriod> = {},
): ScopedBillingArrangementPeriod =>
  period({
    type: BillingArrangementType.LIMIT_OVERRIDE,
    usageLimitId: FIRST_USAGE_LIMIT_ID,
    ...overrides,
  });

describe('findOverlappingBillingArrangement', () => {
  it('finds an open-ended arrangement of the same type', () => {
    const existingArrangement = period();

    expect(
      findOverlappingBillingArrangement({
        arrangement: period({ startsAt: new Date('2027-01-01T00:00:00.000Z') }),
        workspaceArrangements: [existingArrangement],
      }),
    ).toBe(existingArrangement);
  });

  it('finds a later arrangement the new one runs into', () => {
    const existingArrangement = period({
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
    });

    expect(
      findOverlappingBillingArrangement({
        arrangement: period(),
        workspaceArrangements: [existingArrangement],
      }),
    ).toBe(existingArrangement);
  });

  it('finds a bounded arrangement that partly overlaps a bounded one', () => {
    const existingArrangement = period({
      endsAt: new Date('2027-01-01T00:00:00.000Z'),
    });

    expect(
      findOverlappingBillingArrangement({
        arrangement: period({
          startsAt: new Date('2026-12-01T00:00:00.000Z'),
          endsAt: new Date('2027-02-01T00:00:00.000Z'),
        }),
        workspaceArrangements: [existingArrangement],
      }),
    ).toBe(existingArrangement);
  });

  it('ignores an arrangement that ends when it starts', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: period(),
        workspaceArrangements: [
          period({
            startsAt: new Date('2026-12-01T00:00:00.000Z'),
            endsAt: new Date('2026-12-01T00:00:00.000Z'),
          }),
        ],
      }),
    ).toBeUndefined();
  });

  it('ignores another type', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: period(),
        workspaceArrangements: [
          period({ type: BillingArrangementType.COMMITTED_SEATS }),
        ],
      }),
    ).toBeUndefined();
  });

  it('allows a new arrangement to start when the previous one ends', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: period({ startsAt: new Date('2026-12-01T00:00:00.000Z') }),
        workspaceArrangements: [
          period({ endsAt: new Date('2026-12-01T00:00:00.000Z') }),
        ],
      }),
    ).toBeUndefined();
  });

  it('allows a new arrangement to end when the next one starts', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: period({ endsAt: new Date('2026-12-01T00:00:00.000Z') }),
        workspaceArrangements: [
          period({ startsAt: new Date('2026-12-01T00:00:00.000Z') }),
        ],
      }),
    ).toBeUndefined();
  });

  it('ignores an arrangement ended early before the new one starts', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: period({ startsAt: new Date('2026-12-01T00:00:00.000Z') }),
        workspaceArrangements: [
          period({ revokedAt: new Date('2026-11-20T00:00:00.000Z') }),
        ],
      }),
    ).toBeUndefined();
  });

  it('ignores an arrangement cancelled before it started', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: period(),
        workspaceArrangements: [
          period({
            startsAt: new Date('2026-12-01T00:00:00.000Z'),
            revokedAt: new Date('2026-11-15T00:00:00.000Z'),
          }),
        ],
      }),
    ).toBeUndefined();
  });

  it.each([BillingArrangementType.REFUND, BillingArrangementType.CREDIT_GRANT])(
    'never blocks a one-time %s',
    (type) => {
      expect(
        findOverlappingBillingArrangement({
          arrangement: period({ type }),
          workspaceArrangements: [period({ type })],
        }),
      ).toBeUndefined();
    },
  );

  it('finds a limit override on the same usage limit', () => {
    const existingArrangement = limitOverride();

    expect(
      findOverlappingBillingArrangement({
        arrangement: limitOverride({
          startsAt: new Date('2026-12-01T00:00:00.000Z'),
        }),
        workspaceArrangements: [existingArrangement],
      }),
    ).toBe(existingArrangement);
  });

  it('ignores a limit override on another usage limit', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: limitOverride({ usageLimitId: SECOND_USAGE_LIMIT_ID }),
        workspaceArrangements: [limitOverride()],
      }),
    ).toBeUndefined();
  });

  it('allows a limit override to replace one revoked when it starts', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: limitOverride({
          startsAt: new Date('2026-12-01T00:00:00.000Z'),
        }),
        workspaceArrangements: [
          limitOverride({ revokedAt: new Date('2026-12-01T00:00:00.000Z') }),
        ],
      }),
    ).toBeUndefined();
  });

  it('finds an arrangement revoked after the new one starts', () => {
    const existingArrangement = period({
      revokedAt: new Date('2027-01-01T00:00:00.000Z'),
    });

    expect(
      findOverlappingBillingArrangement({
        arrangement: period({ startsAt: new Date('2026-12-01T00:00:00.000Z') }),
        workspaceArrangements: [existingArrangement],
      }),
    ).toBe(existingArrangement);
  });
});
