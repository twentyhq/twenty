import { findUserAllowanceFirstExhaustedKind } from 'src/engine/core-modules/usage-limit/utils/find-user-allowance-first-exhausted-kind.util';

const USER_ALLOWANCE_LIMIT = 1_000;
const WORKSPACE_ALLOWANCE_LIMIT = 5_000;

type UserAllowanceFirstDebit = Parameters<
  typeof findUserAllowanceFirstExhaustedKind
>[0];

const findKind = (overrides: Partial<UserAllowanceFirstDebit>) =>
  findUserAllowanceFirstExhaustedKind({
    outcome: 'applied',
    fallback: 'WORKSPACE_CREDITS',
    userAllowanceConsumed: 0,
    userAllowanceLimitValue: USER_ALLOWANCE_LIMIT,
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
          userAllowanceConsumed: USER_ALLOWANCE_LIMIT,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        }),
      ).toBe('workspaceAllowance');
    });

    it('keeps going while the member still has credits, even with the workspace exhausted', () => {
      expect(
        findKind({
          userAllowanceConsumed: USER_ALLOWANCE_LIMIT - 1,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        }),
      ).toBeNull();
    });

    it('keeps going on workspace credits once the member is exhausted', () => {
      expect(
        findKind({
          userAllowanceConsumed: USER_ALLOWANCE_LIMIT,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT - 1,
        }),
      ).toBeNull();
    });

    it('keeps going when the allowance went unmetered', () => {
      expect(
        findKind({
          userAllowanceConsumed: USER_ALLOWANCE_LIMIT,
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
          userAllowanceConsumed: USER_ALLOWANCE_LIMIT + 200,
          workspaceAllowanceConsumed: null,
        }),
      ).toBe('userAllowance');
    });

    it('keeps going while the member still has credits', () => {
      expect(
        findKind({
          fallback: 'STOP',
          userAllowanceConsumed: USER_ALLOWANCE_LIMIT - 1,
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
          userAllowanceConsumed: null,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        }),
      ).toBe('workspaceAllowance');
    });

    it('keeps going while the workspace has credits or went unmetered', () => {
      expect(
        findKind({
          outcome: 'userAllowanceUnavailable',
          userAllowanceConsumed: null,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT - 1,
        }),
      ).toBeNull();
      expect(
        findKind({
          outcome: 'userAllowanceUnavailable',
          userAllowanceConsumed: null,
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
          userAllowanceConsumed: USER_ALLOWANCE_LIMIT,
          workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        }),
      ).toBeNull();
    });

    it('still reports an exhausted limit', () => {
      expect(
        findKind({
          outcome: 'unknown',
          userAllowanceConsumed: null,
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
        userAllowanceConsumed: USER_ALLOWANCE_LIMIT,
        hasExhaustedLimitCounter: true,
      }),
    ).toBe('userAllowance');
    expect(
      findKind({
        userAllowanceConsumed: USER_ALLOWANCE_LIMIT,
        workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
        hasExhaustedLimitCounter: true,
      }),
    ).toBe('workspaceAllowance');
  });
});
