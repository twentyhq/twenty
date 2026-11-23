/* @license Enterprise */

import { getRecentRenewalDate } from 'src/engine/core-modules/billing/utils/get-recent-renewal-date.util';

const DAY_MS = 24 * 60 * 60 * 1000;
const MARCH = new Date('2026-03-01T00:00:00.000Z');

describe('getRecentRenewalDate', () => {
  it('returns nothing for a seat sync that is not a renewal', () => {
    expect(
      getRecentRenewalDate({
        renewalDateMs: undefined,
        nowMs: MARCH.getTime(),
      }),
    ).toBeUndefined();
  });

  it('returns the renewal date at the renewal', () => {
    expect(
      getRecentRenewalDate({
        renewalDateMs: MARCH.getTime(),
        nowMs: MARCH.getTime(),
      }),
    ).toEqual(MARCH);
  });

  it('returns the renewal date up to a day after the renewal', () => {
    expect(
      getRecentRenewalDate({
        renewalDateMs: MARCH.getTime(),
        nowMs: MARCH.getTime() + DAY_MS,
      }),
    ).toEqual(MARCH);
  });

  it('returns nothing for a late invoice or redelivery past a day', () => {
    expect(
      getRecentRenewalDate({
        renewalDateMs: MARCH.getTime(),
        nowMs: MARCH.getTime() + DAY_MS + 1,
      }),
    ).toBeUndefined();
  });
});
