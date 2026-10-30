/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';

const NOW = new Date('2026-11-15T00:00:00.000Z');

const period = (
  overrides: Partial<BillingArrangementPeriod> = {},
): BillingArrangementPeriod => ({
  type: BillingArrangementType.FREE_SEATS,
  startsAt: new Date('2026-11-01T00:00:00.000Z'),
  endsAt: null,
  revokedAt: null,
  ...overrides,
});

describe('isBillingArrangementActive', () => {
  it('is active between its start and end dates', () => {
    expect(
      isBillingArrangementActive(
        period({ endsAt: new Date('2026-12-01T00:00:00.000Z') }),
        NOW,
      ),
    ).toBe(true);
  });

  it('is active with no end date', () => {
    expect(isBillingArrangementActive(period(), NOW)).toBe(true);
  });

  it('is not active before it starts', () => {
    expect(
      isBillingArrangementActive(
        period({ startsAt: new Date('2026-11-16T00:00:00.000Z') }),
        NOW,
      ),
    ).toBe(false);
  });

  it('is not active from its end date', () => {
    expect(isBillingArrangementActive(period({ endsAt: NOW }), NOW)).toBe(
      false,
    );
  });

  it('is not active once ended early', () => {
    expect(
      isBillingArrangementActive(
        period({
          endsAt: new Date('2027-01-01T00:00:00.000Z'),
          revokedAt: new Date('2026-11-10T00:00:00.000Z'),
        }),
        NOW,
      ),
    ).toBe(false);
  });

  it('is never active for a one-time type', () => {
    expect(
      isBillingArrangementActive(
        period({ type: BillingArrangementType.REFUND }),
        NOW,
      ),
    ).toBe(false);
  });
});
