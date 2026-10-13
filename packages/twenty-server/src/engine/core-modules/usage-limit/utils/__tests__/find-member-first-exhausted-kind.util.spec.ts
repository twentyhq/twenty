import { findMemberFirstExhaustedKind } from 'src/engine/core-modules/usage-limit/utils/find-member-first-exhausted-kind.util';

const MEMBER_LIMIT = 1_000;
const ALLOWANCE_LIMIT = 5_000;

type MemberFirstDebit = Parameters<typeof findMemberFirstExhaustedKind>[0];

const findKind = (overrides: Partial<MemberFirstDebit>) =>
  findMemberFirstExhaustedKind({
    outcome: 'applied',
    fallback: 'WORKSPACE_CREDITS',
    memberConsumed: 0,
    memberLimitValue: MEMBER_LIMIT,
    allowanceConsumed: 0,
    allowanceLimitValue: ALLOWANCE_LIMIT,
    hasExhaustedLimitCounter: false,
    ...overrides,
  });

describe('findMemberFirstExhaustedKind', () => {
  describe('when the split was applied in WORKSPACE_CREDITS mode', () => {
    it('stops on the allowance once both the member and the workspace are exhausted', () => {
      expect(
        findKind({
          memberConsumed: MEMBER_LIMIT,
          allowanceConsumed: ALLOWANCE_LIMIT,
        }),
      ).toBe('allowance');
    });

    it('keeps going while the member still has credits, even with the workspace exhausted', () => {
      expect(
        findKind({
          memberConsumed: MEMBER_LIMIT - 1,
          allowanceConsumed: ALLOWANCE_LIMIT,
        }),
      ).toBeNull();
    });

    it('keeps going on workspace credits once the member is exhausted', () => {
      expect(
        findKind({
          memberConsumed: MEMBER_LIMIT,
          allowanceConsumed: ALLOWANCE_LIMIT - 1,
        }),
      ).toBeNull();
    });

    it('keeps going when the allowance went unmetered', () => {
      expect(
        findKind({ memberConsumed: MEMBER_LIMIT, allowanceConsumed: null }),
      ).toBeNull();
    });
  });

  describe('when the split was applied in STOP mode', () => {
    it('stops on the member allowance once the member is exhausted', () => {
      expect(
        findKind({
          fallback: 'STOP',
          memberConsumed: MEMBER_LIMIT + 200,
          allowanceConsumed: null,
        }),
      ).toBe('memberAllowance');
    });

    it('keeps going while the member still has credits', () => {
      expect(
        findKind({
          fallback: 'STOP',
          memberConsumed: MEMBER_LIMIT - 1,
          allowanceConsumed: null,
        }),
      ).toBeNull();
    });
  });

  describe('when the member was unavailable', () => {
    it('stops on the allowance like a workspace-funded charge', () => {
      expect(
        findKind({
          outcome: 'memberUnavailable',
          memberConsumed: null,
          allowanceConsumed: ALLOWANCE_LIMIT,
        }),
      ).toBe('allowance');
    });

    it('keeps going while the workspace has credits or went unmetered', () => {
      expect(
        findKind({
          outcome: 'memberUnavailable',
          memberConsumed: null,
          allowanceConsumed: ALLOWANCE_LIMIT - 1,
        }),
      ).toBeNull();
      expect(
        findKind({
          outcome: 'memberUnavailable',
          memberConsumed: null,
          allowanceConsumed: null,
        }),
      ).toBeNull();
    });
  });

  describe('when the outcome is unknown', () => {
    it('never stops on the allowance or the member allowance', () => {
      expect(
        findKind({
          outcome: 'unknown',
          memberConsumed: MEMBER_LIMIT,
          allowanceConsumed: ALLOWANCE_LIMIT,
        }),
      ).toBeNull();
    });

    it('still reports an exhausted limit', () => {
      expect(
        findKind({
          outcome: 'unknown',
          memberConsumed: null,
          allowanceConsumed: null,
          hasExhaustedLimitCounter: true,
        }),
      ).toBe('limit');
    });
  });

  it('reports an exhausted limit when no credit counter stops', () => {
    expect(findKind({ hasExhaustedLimitCounter: true })).toBe('limit');
  });

  it('puts a credit stop before an exhausted limit', () => {
    expect(
      findKind({
        fallback: 'STOP',
        memberConsumed: MEMBER_LIMIT,
        hasExhaustedLimitCounter: true,
      }),
    ).toBe('memberAllowance');
    expect(
      findKind({
        memberConsumed: MEMBER_LIMIT,
        allowanceConsumed: ALLOWANCE_LIMIT,
        hasExhaustedLimitCounter: true,
      }),
    ).toBe('allowance');
  });
});
