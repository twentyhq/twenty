import { buildCreditCounterCheck } from 'src/engine/core-modules/usage-limit/utils/build-credit-counter-check.util';

const KEY = '{workspace-id}:quota-consumed:member-allowance:member-id:0';
const TURN_COST_MICRO = 500;
const MEMBER_CREDITS_AMOUNT_MICRO = 10_000;

type CreditCounterCheckArgs = Parameters<typeof buildCreditCounterCheck>[0];

const buildCheck = (overrides: Partial<CreditCounterCheckArgs>) =>
  buildCreditCounterCheck({
    key: KEY,
    liveValueMicro: 1_000,
    rebuiltValueMicro: 1_000,
    turnCostMicro: TURN_COST_MICRO,
    ...overrides,
  });

describe('buildCreditCounterCheck', () => {
  it('reports no drift when the live value equals the rebuilt value', () => {
    expect(buildCheck({})).toEqual({
      key: KEY,
      liveValueMicro: 1_000,
      rebuiltValueMicro: 1_000,
      driftMicro: 0,
      isDrifted: false,
      isOverrun: false,
    });
  });

  it('does not flag a drift of exactly one turn cost', () => {
    expect(
      buildCheck({ liveValueMicro: 1_000 + TURN_COST_MICRO }),
    ).toMatchObject({ driftMicro: TURN_COST_MICRO, isDrifted: false });
  });

  it('flags a live value above the rebuilt value by more than one turn cost', () => {
    expect(
      buildCheck({ liveValueMicro: 1_000 + TURN_COST_MICRO + 1 }),
    ).toMatchObject({ driftMicro: TURN_COST_MICRO + 1, isDrifted: true });
  });

  it('flags a live value below the rebuilt value by more than one turn cost', () => {
    expect(
      buildCheck({ liveValueMicro: 1_000 - TURN_COST_MICRO - 1 }),
    ).toMatchObject({ driftMicro: -TURN_COST_MICRO - 1, isDrifted: true });
  });

  it('reports no drift for a cold counter, whatever the rebuilt value', () => {
    expect(
      buildCheck({ liveValueMicro: null, rebuiltValueMicro: 1_000_000 }),
    ).toMatchObject({ driftMicro: null, isDrifted: false });
  });

  it('never flags an overrun without member credits', () => {
    expect(
      buildCheck({ liveValueMicro: null, rebuiltValueMicro: 1_000_000 }),
    ).toMatchObject({ isOverrun: false });
  });

  describe('with member credits in WORKSPACE_CREDITS mode', () => {
    const memberCredits = {
      amountMicro: MEMBER_CREDITS_AMOUNT_MICRO,
      fallback: 'WORKSPACE_CREDITS' as const,
    };

    it('does not flag a slice sum of exactly the member credits plus one turn cost', () => {
      expect(
        buildCheck({
          memberCredits,
          rebuiltValueMicro: MEMBER_CREDITS_AMOUNT_MICRO + TURN_COST_MICRO,
        }),
      ).toMatchObject({ isOverrun: false });
    });

    it('flags a slice sum above the member credits plus one turn cost', () => {
      expect(
        buildCheck({
          memberCredits,
          liveValueMicro: null,
          rebuiltValueMicro: MEMBER_CREDITS_AMOUNT_MICRO + TURN_COST_MICRO + 1,
        }),
      ).toMatchObject({ isOverrun: true, isDrifted: false });
    });
  });

  it('never flags an overrun in STOP mode', () => {
    expect(
      buildCheck({
        memberCredits: {
          amountMicro: MEMBER_CREDITS_AMOUNT_MICRO,
          fallback: 'STOP',
        },
        liveValueMicro: null,
        rebuiltValueMicro: 2 * MEMBER_CREDITS_AMOUNT_MICRO,
      }),
    ).toMatchObject({ isOverrun: false });
  });
});
