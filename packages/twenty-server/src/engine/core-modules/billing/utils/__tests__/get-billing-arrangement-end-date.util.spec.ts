/* @license Enterprise */

import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';

const EARLIER = new Date('2026-11-15T00:00:00.000Z');
const LATER = new Date('2026-12-01T00:00:00.000Z');

describe('getBillingArrangementEndDate', () => {
  it.each<[string, Date | null, Date | null, Date | null]>([
    ['no end and no revocation', null, null, null],
    ['an end date only', LATER, null, LATER],
    ['a revocation only', null, EARLIER, EARLIER],
    ['a revocation before the end date', LATER, EARLIER, EARLIER],
    ['a revocation after the end date', EARLIER, LATER, EARLIER],
  ])('returns the end of %s', (_, endsAt, revokedAt, expectedEndDate) => {
    expect(getBillingArrangementEndDate({ endsAt, revokedAt })).toEqual(
      expectedEndDate,
    );
  });
});
