/* @license Enterprise */

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import {
  computeCarryForwardGrants,
  type CarryForwardGrantInput,
} from 'src/engine/core-modules/billing/utils/compute-carry-forward-grants.util';

const BOUNDARY = new Date('2026-02-01T00:00:00.000Z');

const grant = (
  overrides: Partial<CarryForwardGrantInput> = {},
): CarryForwardGrantInput => ({
  grantId: 'grant_1',
  type: BillingCreditGrantType.ROLLOVER,
  amountMicro: 0,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  expiresAt: null,
  ...overrides,
});

const ALLOWANCE = 1_000_000;
// A cap multiplier of 2 means total credits never exceed twice the allowance,
// so at most one full allowance can roll over.
const ROLLOVER_CAP = ALLOWANCE;

describe('computeCarryForwardGrants', () => {
  describe('plan allowance', () => {
    it('rolls the unspent allowance over', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [],
        usageMicro: 300_000,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: 700_000,
          sourceGrantId: null,
          expiresAt: null,
        },
      ]);
    });

    it('returns nothing when the allowance was fully spent', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [],
        usageMicro: ALLOWANCE,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([]);
    });

    it('returns nothing when usage exceeded everything available', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [grant({ amountMicro: 200_000 })],
        usageMicro: 5_000_000,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([]);
    });
  });

  describe('rollover cap', () => {
    it('clamps the rolled-over amount to the cap', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({ grantId: 'previous_rollover', amountMicro: ALLOWANCE }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: ROLLOVER_CAP,
          sourceGrantId: null,
          expiresAt: null,
        },
      ]);
    });

    it('merges the allowance and previous rollovers into a single grant', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({ grantId: 'previous_rollover', amountMicro: 400_000 }),
        ],
        usageMicro: 1_200_000,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: 200_000,
          sourceGrantId: null,
          expiresAt: null,
        },
      ]);
    });

    it('rolls nothing over when the cap is zero', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [],
        usageMicro: 0,
        rolloverCapMicro: 0,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([]);
    });
  });

  describe('granted credits', () => {
    it('carries a compensation grant over in full, past the rollover cap', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({
            grantId: 'compensation_1',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 200_000_000,
          }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: ROLLOVER_CAP,
          sourceGrantId: null,
          expiresAt: null,
        },
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 200_000_000,
          sourceGrantId: 'compensation_1',
          expiresAt: null,
        },
      ]);
    });

    it('spends the plan allowance before touching granted credits', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({
            grantId: 'compensation_1',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 500_000,
          }),
        ],
        usageMicro: ALLOWANCE,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 500_000,
          sourceGrantId: 'compensation_1',
          expiresAt: null,
        },
      ]);
    });

    it('eats into granted credits once the allowance and rollovers are gone', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({ grantId: 'previous_rollover', amountMicro: 500_000 }),
          grant({
            grantId: 'reward_1',
            type: BillingCreditGrantType.ONBOARDING_REWARD,
            amountMicro: 1_000_000,
          }),
        ],
        usageMicro: 2_000_000,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ONBOARDING_REWARD,
          amountMicro: 500_000,
          sourceGrantId: 'reward_1',
          expiresAt: null,
        },
      ]);
    });

    it('keeps each granted credit as its own grant, oldest spent first', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: 0,
        liveGrants: [
          grant({
            grantId: 'reward_old',
            type: BillingCreditGrantType.ONBOARDING_REWARD,
            amountMicro: 400_000,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          }),
          grant({
            grantId: 'compensation_new',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 600_000,
            createdAt: new Date('2026-02-01T00:00:00.000Z'),
          }),
        ],
        usageMicro: 500_000,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 500_000,
          sourceGrantId: 'compensation_new',
          expiresAt: null,
        },
      ]);
    });
  });

  describe('edge cases', () => {
    it('treats a negative allowance as zero', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: -1_000,
        liveGrants: [],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([]);
    });

    it('treats negative usage as zero', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [],
        usageMicro: -500_000,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: ALLOWANCE,
          sourceGrantId: null,
          expiresAt: null,
        },
      ]);
    });

    it('emits whole micro-credits only', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({
            grantId: 'compensation_1',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 1_000,
          }),
        ],
        usageMicro: 999_999.5,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      // The half micro-credit left of the allowance floors to nothing, so no
      // rollover grant is emitted at all.
      expect(result).toEqual([
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 1_000,
          sourceGrantId: 'compensation_1',
          expiresAt: null,
        },
      ]);
    });

    it('ignores grants with no remaining amount', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: 0,
        liveGrants: [
          grant({
            grantId: 'empty',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 0,
          }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([]);
    });
  });

  describe('time-boxed grants', () => {
    const IN_THE_NEXT_PERIOD = new Date('2026-02-20T00:00:00.000Z');
    const INSIDE_THE_CLOSING_PERIOD = new Date('2026-01-10T00:00:00.000Z');

    it('carries the deadline over so a grant does not become permanent', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: 0,
        liveGrants: [
          grant({
            grantId: 'sales_1',
            type: BillingCreditGrantType.SALES,
            amountMicro: 500_000,
            expiresAt: IN_THE_NEXT_PERIOD,
          }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.SALES,
          amountMicro: 500_000,
          sourceGrantId: 'sales_1',
          expiresAt: IN_THE_NEXT_PERIOD,
        },
      ]);
    });

    it('drops a grant whose deadline fell inside the closing period', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: 0,
        liveGrants: [
          grant({
            grantId: 'sales_1',
            type: BillingCreditGrantType.SALES,
            amountMicro: 500_000,
            expiresAt: INSIDE_THE_CLOSING_PERIOD,
          }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([]);
    });

    it('drops a grant that lapses exactly on the boundary', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: 0,
        liveGrants: [
          grant({
            grantId: 'sales_1',
            type: BillingCreditGrantType.SALES,
            amountMicro: 500_000,
            expiresAt: BOUNDARY,
          }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([]);
    });

    // It was spendable for part of the period, so the usage it absorbed must
    // not fall back onto the grants that outlive it.
    it('still absorbs usage before lapsing', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: 0,
        liveGrants: [
          grant({
            grantId: 'sales_1',
            type: BillingCreditGrantType.SALES,
            amountMicro: 500_000,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            expiresAt: INSIDE_THE_CLOSING_PERIOD,
          }),
          grant({
            grantId: 'compensation_1',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 500_000,
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
          }),
        ],
        usageMicro: 500_000,
        rolloverCapMicro: ROLLOVER_CAP,
        boundary: BOUNDARY,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 500_000,
          sourceGrantId: 'compensation_1',
          expiresAt: null,
        },
      ]);
    });
  });
});
