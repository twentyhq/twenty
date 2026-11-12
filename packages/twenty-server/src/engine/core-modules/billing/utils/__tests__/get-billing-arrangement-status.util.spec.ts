/* @license Enterprise */

import { BillingArrangementStatus } from 'src/engine/core-modules/billing/enums/billing-arrangement-status.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';
import { getBillingArrangementStatus } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-status.util';

const NOW = new Date('2026-11-15T00:00:00.000Z');

const getStatus = (overrides: Partial<BillingArrangementPeriod>) =>
  getBillingArrangementStatus({
    arrangement: {
      type: BillingArrangementType.FREE_SEATS,
      startsAt: new Date('2026-11-01T00:00:00.000Z'),
      endsAt: null,
      revokedAt: null,
      ...overrides,
    },
    now: NOW,
  });

describe('getBillingArrangementStatus', () => {
  it('is active between its start and end dates', () => {
    expect(getStatus({})).toBe(BillingArrangementStatus.ACTIVE);
  });

  it('is scheduled when it starts later', () => {
    expect(getStatus({ startsAt: new Date('2026-12-01T00:00:00.000Z') })).toBe(
      BillingArrangementStatus.SCHEDULED,
    );
  });

  it('is ended when it was revoked before its start', () => {
    expect(
      getStatus({
        startsAt: new Date('2026-12-01T00:00:00.000Z'),
        revokedAt: new Date('2026-11-10T00:00:00.000Z'),
      }),
    ).toBe(BillingArrangementStatus.ENDED);
  });

  it('is ended once its end date has passed', () => {
    expect(getStatus({ endsAt: new Date('2026-11-10T00:00:00.000Z') })).toBe(
      BillingArrangementStatus.ENDED,
    );
  });

  it('is one-time for refunds', () => {
    expect(getStatus({ type: BillingArrangementType.REFUND })).toBe(
      BillingArrangementStatus.ONE_TIME,
    );
  });
});
