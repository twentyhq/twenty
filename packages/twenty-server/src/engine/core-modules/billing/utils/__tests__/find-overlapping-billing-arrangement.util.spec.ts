/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { findOverlappingBillingArrangement } from 'src/engine/core-modules/billing/utils/find-overlapping-billing-arrangement.util';

const period = (
  overrides: Partial<BillingArrangementPeriod> = {},
): BillingArrangementPeriod => ({
  type: BillingArrangementType.FREE_SEATS,
  startsAt: new Date('2026-11-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
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

  it('never blocks a one-time type', () => {
    expect(
      findOverlappingBillingArrangement({
        arrangement: period({ type: BillingArrangementType.REFUND }),
        workspaceArrangements: [
          period({ type: BillingArrangementType.REFUND }),
        ],
      }),
    ).toBeUndefined();
  });
});
