import { type CreditAllowanceGrant } from 'src/engine/core-modules/usage-limit/types/credit-allowance-grant.type';
import { findCreditAllowanceValidUntil } from 'src/engine/core-modules/usage-limit/utils/find-credit-allowance-valid-until.util';

const NOW_MS = new Date('2026-08-15T00:00:00.000Z').getTime();
const PERIOD_END_MS = new Date('2026-09-01T00:00:00.000Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

const buildGrant = (
  overrides: Partial<CreditAllowanceGrant>,
): CreditAllowanceGrant => ({
  amountMicro: 500,
  effectiveAtMs: NOW_MS - DAY_MS,
  expiresAtMs: null,
  ...overrides,
});

describe('findCreditAllowanceValidUntil', () => {
  it('is the period end when no grant changes the allowance before it', () => {
    expect(
      findCreditAllowanceValidUntil({
        schedule: {
          planAllowanceMicro: 1_000,
          grants: [
            buildGrant({}),
            buildGrant({ expiresAtMs: PERIOD_END_MS + DAY_MS }),
          ],
        },
        nowMs: NOW_MS,
        periodEndMs: PERIOD_END_MS,
      }),
    ).toBe(PERIOD_END_MS);
  });

  it('stops at the first grant that expires inside the period', () => {
    expect(
      findCreditAllowanceValidUntil({
        schedule: {
          planAllowanceMicro: 1_000,
          grants: [
            buildGrant({ expiresAtMs: NOW_MS + 3 * DAY_MS }),
            buildGrant({ expiresAtMs: NOW_MS + 2 * DAY_MS }),
          ],
        },
        nowMs: NOW_MS,
        periodEndMs: PERIOD_END_MS,
      }),
    ).toBe(NOW_MS + 2 * DAY_MS);
  });

  it('stops at a grant that becomes effective inside the period', () => {
    expect(
      findCreditAllowanceValidUntil({
        schedule: {
          planAllowanceMicro: 1_000,
          grants: [buildGrant({ effectiveAtMs: NOW_MS + DAY_MS })],
        },
        nowMs: NOW_MS,
        periodEndMs: PERIOD_END_MS,
      }),
    ).toBe(NOW_MS + DAY_MS);
  });

  it('ignores a boundary that has already passed', () => {
    expect(
      findCreditAllowanceValidUntil({
        schedule: {
          planAllowanceMicro: 1_000,
          grants: [buildGrant({ expiresAtMs: NOW_MS })],
        },
        nowMs: NOW_MS,
        periodEndMs: PERIOD_END_MS,
      }),
    ).toBe(PERIOD_END_MS);
  });
});
