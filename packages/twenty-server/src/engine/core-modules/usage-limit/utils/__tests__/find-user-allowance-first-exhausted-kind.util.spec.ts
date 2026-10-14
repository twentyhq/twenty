import { findUserAllowanceFirstExhaustedKind } from 'src/engine/core-modules/usage-limit/utils/find-user-allowance-first-exhausted-kind.util';

const WORKSPACE_ALLOWANCE_LIMIT = 5_000;

type UserAllowanceFirstDebit = Parameters<
  typeof findUserAllowanceFirstExhaustedKind
>[0];

const findKind = (overrides: Partial<UserAllowanceFirstDebit>) =>
  findUserAllowanceFirstExhaustedKind({
    outcome: 'applied',
    fallback: 'WORKSPACE_CREDITS',
    isUserAllowanceExhausted: false,
    workspaceAllowanceConsumed: 0,
    workspaceAllowanceLimitValue: WORKSPACE_ALLOWANCE_LIMIT,
    hasExhaustedLimitCounter: false,
    ...overrides,
  });

describe('findUserAllowanceFirstExhaustedKind', () => {
  describe('when the split was applied in WORKSPACE_CREDITS mode', () => {
    it('stops on the allowance once both the member and the workspace are exhausted', () => {
      expect(
        findKind({
          isUserAllowanceExhausted: true,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        }),
      ).toBe('workspaceAllowance');
    });

    it('keeps going while the member still has credits, even with the workspace exhausted', () => {
      expect(
        findKind({
          isUserAllowanceExhausted: false,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        }),
      ).toBeNull();
    });

    it('keeps going on workspace credits once the member is exhausted', () => {
      expect(
        findKind({
          isUserAllowanceExhausted: true,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT - 1,
        }),
      ).toBeNull();
    });

    it('keeps going when the allowance went unmetered', () => {
      expect(
        findKind({
          isUserAllowanceExhausted: true,
          workspaceAllowanceConsumed: null,
        }),
      ).toBeNull();
    });
  });

  describe('when the split was applied in STOP mode', () => {
    it('stops on the user allowance once the member is exhausted', () => {
      expect(
        findKind({
          fallback: 'STOP',
          isUserAllowanceExhausted: true,
          workspaceAllowanceConsumed: null,
        }),
      ).toBe('userAllowance');
    });

    it('keeps going while the member still has credits', () => {
      expect(
        findKind({
          fallback: 'STOP',
          isUserAllowanceExhausted: false,
          workspaceAllowanceConsumed: null,
        }),
      ).toBeNull();
    });
  });

  describe('when the member was unavailable', () => {
    it('stops on the allowance like a workspace credits charge', () => {
      expect(
        findKind({
          outcome: 'userAllowanceUnavailable',
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        }),
      ).toBe('workspaceAllowance');
    });

    it('keeps going while the workspace has credits or went unmetered', () => {
      expect(
        findKind({
          outcome: 'userAllowanceUnavailable',
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT - 1,
        }),
      ).toBeNull();
      expect(
        findKind({
          outcome: 'userAllowanceUnavailable',
          workspaceAllowanceConsumed: null,
        }),
      ).toBeNull();
    });
  });

  describe('when the outcome is unknown', () => {
    it('never stops on the allowance or the user allowance', () => {
      expect(
        findKind({
          outcome: 'unknown',
          isUserAllowanceExhausted: true,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        }),
      ).toBeNull();
    });

    it('still reports an exhausted limit', () => {
      expect(
        findKind({
          outcome: 'unknown',
          workspaceAllowanceConsumed: null,
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
        isUserAllowanceExhausted: true,
        hasExhaustedLimitCounter: true,
      }),
    ).toBe('userAllowance');
    expect(
      findKind({
        isUserAllowanceExhausted: true,
        workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        hasExhaustedLimitCounter: true,
      }),
    ).toBe('workspaceAllowance');
  });
});
