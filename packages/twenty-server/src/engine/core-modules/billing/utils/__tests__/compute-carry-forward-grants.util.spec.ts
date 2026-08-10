/* @license Enterprise */

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import {
  computeCarryForwardGrants,
  type CarryForwardGrantInput,
} from 'src/engine/core-modules/billing/utils/compute-carry-forward-grants.util';

const grant = (
  overrides: Partial<CarryForwardGrantInput> = {},
): CarryForwardGrantInput => ({
  id: 'grant_1',
  type: BillingCreditGrantType.ROLLOVER,
  amountMicro: 0,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
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
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: 700_000,
          sourceGrantId: null,
        },
      ]);
    });

    it('returns nothing when the allowance was fully spent', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [],
        usageMicro: ALLOWANCE,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([]);
    });

    it('returns nothing when usage exceeded everything available', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [grant({ amountMicro: 200_000 })],
        usageMicro: 5_000_000,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([]);
    });
  });

  describe('rollover cap', () => {
    it('clamps the rolled-over amount to the cap', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({ id: 'previous_rollover', amountMicro: ALLOWANCE }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: ROLLOVER_CAP,
          sourceGrantId: null,
        },
      ]);
    });

    it('merges the allowance and previous rollovers into a single grant', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [grant({ id: 'previous_rollover', amountMicro: 400_000 })],
        usageMicro: 1_200_000,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: 200_000,
          sourceGrantId: null,
        },
      ]);
    });

    it('rolls nothing over when the cap is zero', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [],
        usageMicro: 0,
        rolloverCapMicro: 0,
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
            id: 'compensation_1',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 200_000_000,
          }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: ROLLOVER_CAP,
          sourceGrantId: null,
        },
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 200_000_000,
          sourceGrantId: 'compensation_1',
        },
      ]);
    });

    it('spends the plan allowance before touching granted credits', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({
            id: 'compensation_1',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 500_000,
          }),
        ],
        usageMicro: ALLOWANCE,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 500_000,
          sourceGrantId: 'compensation_1',
        },
      ]);
    });

    it('eats into granted credits once the allowance and rollovers are gone', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({ id: 'previous_rollover', amountMicro: 500_000 }),
          grant({
            id: 'reward_1',
            type: BillingCreditGrantType.ONBOARDING_REWARD,
            amountMicro: 1_000_000,
          }),
        ],
        usageMicro: 2_000_000,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ONBOARDING_REWARD,
          amountMicro: 500_000,
          sourceGrantId: 'reward_1',
        },
      ]);
    });

    it('keeps each granted credit as its own grant, oldest spent first', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: 0,
        liveGrants: [
          grant({
            id: 'reward_old',
            type: BillingCreditGrantType.ONBOARDING_REWARD,
            amountMicro: 400_000,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          }),
          grant({
            id: 'compensation_new',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 600_000,
            createdAt: new Date('2026-02-01T00:00:00.000Z'),
          }),
        ],
        usageMicro: 500_000,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 500_000,
          sourceGrantId: 'compensation_new',
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
      });

      expect(result).toEqual([]);
    });

    it('treats negative usage as zero', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [],
        usageMicro: -500_000,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([
        {
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: ALLOWANCE,
          sourceGrantId: null,
        },
      ]);
    });

    it('emits whole micro-credits only', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: ALLOWANCE,
        liveGrants: [
          grant({
            id: 'compensation_1',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 1_000,
          }),
        ],
        usageMicro: 999_999.5,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      // The half micro-credit left of the allowance floors to nothing, so no
      // rollover grant is emitted at all.
      expect(result).toEqual([
        {
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 1_000,
          sourceGrantId: 'compensation_1',
        },
      ]);
    });

    it('ignores grants with no remaining amount', () => {
      const result = computeCarryForwardGrants({
        allowanceMicro: 0,
        liveGrants: [
          grant({
            id: 'empty',
            type: BillingCreditGrantType.COMPENSATION,
            amountMicro: 0,
          }),
        ],
        usageMicro: 0,
        rolloverCapMicro: ROLLOVER_CAP,
      });

      expect(result).toEqual([]);
    });
  });
});
