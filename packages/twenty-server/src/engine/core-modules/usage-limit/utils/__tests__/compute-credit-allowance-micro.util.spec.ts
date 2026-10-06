import { type CreditAllowanceGrant } from 'src/engine/core-modules/usage-limit/types/credit-allowance-grant.type';
import { computeCreditAllowanceMicro } from 'src/engine/core-modules/usage-limit/utils/compute-credit-allowance-micro.util';

const NOW_MS = new Date('2026-08-15T00:00:00.000Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

const buildGrant = (
  overrides: Partial<CreditAllowanceGrant>,
): CreditAllowanceGrant => ({
  amountMicro: 500,
  effectiveAtMs: NOW_MS - DAY_MS,
  expiresAtMs: null,
  ...overrides,
});

describe('computeCreditAllowanceMicro', () => {
  it('is the plan allowance when there is no grant', () => {
    expect(
      computeCreditAllowanceMicro({
        schedule: { planAllowanceMicro: 1_000, grants: [] },
        nowMs: NOW_MS,
      }),
    ).toBe(1_000);
  });

  it('adds every grant in effect', () => {
    expect(
      computeCreditAllowanceMicro({
        schedule: {
          planAllowanceMicro: 1_000,
          grants: [
            buildGrant({ amountMicro: 500 }),
            buildGrant({ amountMicro: 300, expiresAtMs: NOW_MS + DAY_MS }),
          ],
        },
        nowMs: NOW_MS,
      }),
    ).toBe(1_800);
  });

  it('leaves out a grant that is not effective yet', () => {
    expect(
      computeCreditAllowanceMicro({
        schedule: {
          planAllowanceMicro: 1_000,
          grants: [buildGrant({ effectiveAtMs: NOW_MS + 1 })],
        },
        nowMs: NOW_MS,
      }),
    ).toBe(1_000);
  });

  it('counts a grant from the instant it becomes effective', () => {
    expect(
      computeCreditAllowanceMicro({
        schedule: {
          planAllowanceMicro: 1_000,
          grants: [buildGrant({ effectiveAtMs: NOW_MS })],
        },
        nowMs: NOW_MS,
      }),
    ).toBe(1_500);
  });

  it('leaves out a grant from the instant it expires', () => {
    expect(
      computeCreditAllowanceMicro({
        schedule: {
          planAllowanceMicro: 1_000,
          grants: [buildGrant({ expiresAtMs: NOW_MS })],
        },
        nowMs: NOW_MS,
      }),
    ).toBe(1_000);
  });
});
