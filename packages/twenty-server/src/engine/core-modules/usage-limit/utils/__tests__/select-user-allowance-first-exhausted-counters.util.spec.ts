import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { type UserCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/user-credits-fallback-mode.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { selectUserAllowanceFirstExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/select-user-allowance-first-exhausted-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');
const USER_ALLOWANCE_LIMIT = 1_000;
const WORKSPACE_ALLOWANCE_LIMIT = 5_000;

type CounterState = 'below' | 'reached' | 'unreadable';

type ExpectedKind = 'workspaceAllowance' | 'userAllowance' | 'limit' | null;

const limitCounter: LimitQuotaCounter = {
  kind: 'limit',
  isDefault: false,
  key: 'limit-key',
  limitValue: 2_000,
  unit: UsageUnit.CREDIT,
  resourceType: UsageResourceType.AI,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'userWorkspace',
  spenderId: 'user-workspace-1',
  operationType: UsageOperationType.AI_CHAT_TOKEN,
};

const workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter = {
  kind: 'workspaceAllowance',
  key: 'workspace-allowance-key',
  limitValue: WORKSPACE_ALLOWANCE_LIMIT,
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
};

const buildUserAllowanceCounter = (
  fallback: UserCreditsFallbackMode,
): UserAllowanceQuotaCounter => ({
  kind: 'userAllowance',
  key: 'user-allowance-key',
  limitValue: USER_ALLOWANCE_LIMIT,
  unit: UsageUnit.USER_CREDIT,
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  periodUnit: 'week',
  userWorkspaceId: 'user-workspace-1',
  periodStart: PERIOD_START,
  periodEnd: new Date('2026-08-20T00:00:00.000Z'),
  fallback,
});

const toConsumed = (state: CounterState, limitValue: number): number | null => {
  switch (state) {
    case 'below':
      return limitValue - 1;
    case 'reached':
      return limitValue;
    case 'unreadable':
      return null;
  }
};

const select = ({
  fallback,
  userAllowance,
  workspaceAllowance,
  isLimitExhausted = false,
}: {
  fallback: UserCreditsFallbackMode;
  userAllowance: CounterState;
  workspaceAllowance: CounterState;
  isLimitExhausted?: boolean;
}) => {
  const userAllowanceCounter = buildUserAllowanceCounter(fallback);
  const exhaustedCounters: QuotaCounter[] = [
    ...(isLimitExhausted ? [limitCounter] : []),
    ...(workspaceAllowance === 'reached' ? [workspaceAllowanceCounter] : []),
    ...(userAllowance === 'reached' ? [userAllowanceCounter] : []),
  ];

  return selectUserAllowanceFirstExhaustedCounters({
    exhaustedCounters,
    userAllowanceCounter,
    userAllowanceConsumed: toConsumed(userAllowance, USER_ALLOWANCE_LIMIT),
    workspaceAllowanceConsumed: toConsumed(
      workspaceAllowance,
      WORKSPACE_ALLOWANCE_LIMIT,
    ),
  });
};

const toKinds = (counters: QuotaCounter[]) =>
  counters.map((counter) => counter.kind);

describe('selectUserAllowanceFirstExhaustedCounters', () => {
  describe.each<{
    fallback: UserCreditsFallbackMode;
    userAllowance: CounterState;
    workspaceAllowance: CounterState;
    expectedKind: ExpectedKind;
    hasUserCreditsLeft: boolean;
    hasWorkspaceCreditsLeft: boolean;
  }>([
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'below',
      workspaceAllowance: 'below',
      expectedKind: null,
      hasUserCreditsLeft: true,
      hasWorkspaceCreditsLeft: true,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'below',
      workspaceAllowance: 'reached',
      expectedKind: null,
      hasUserCreditsLeft: true,
      hasWorkspaceCreditsLeft: false,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'below',
      workspaceAllowance: 'unreadable',
      expectedKind: null,
      hasUserCreditsLeft: true,
      hasWorkspaceCreditsLeft: false,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'reached',
      workspaceAllowance: 'below',
      expectedKind: null,
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: true,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'reached',
      workspaceAllowance: 'reached',
      expectedKind: 'workspaceAllowance',
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: false,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'reached',
      workspaceAllowance: 'unreadable',
      expectedKind: null,
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: true,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'unreadable',
      workspaceAllowance: 'below',
      expectedKind: null,
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: true,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'unreadable',
      workspaceAllowance: 'reached',
      expectedKind: 'workspaceAllowance',
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: false,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'unreadable',
      workspaceAllowance: 'unreadable',
      expectedKind: null,
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: true,
    },
    {
      fallback: 'STOP',
      userAllowance: 'reached',
      workspaceAllowance: 'below',
      expectedKind: 'userAllowance',
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: true,
    },
    {
      fallback: 'STOP',
      userAllowance: 'reached',
      workspaceAllowance: 'reached',
      expectedKind: 'userAllowance',
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: false,
    },
    {
      fallback: 'STOP',
      userAllowance: 'reached',
      workspaceAllowance: 'unreadable',
      expectedKind: 'userAllowance',
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: false,
    },
  ])(
    'in $fallback mode with the userAllowance $userAllowance and the workspaceAllowance $workspaceAllowance',
    ({
      fallback,
      userAllowance,
      workspaceAllowance,
      expectedKind,
      hasUserCreditsLeft,
      hasWorkspaceCreditsLeft,
    }) => {
      it(
        expectedKind === null ? 'admits' : `refuses on ${expectedKind}`,
        () => {
          expect(
            toKinds(
              select({ fallback, userAllowance, workspaceAllowance })
                .exhaustedCounters,
            ),
          ).toEqual(expectedKind === null ? [] : [expectedKind]);
        },
      );

      it('reports the user allowance counter and which credits are left', () => {
        expect(
          select({ fallback, userAllowance, workspaceAllowance }),
        ).toMatchObject({
          hasUserAllowanceCounter: true,
          hasUserCreditsLeft,
          hasWorkspaceCreditsLeft,
        });
      });
    },
  );

  it('keeps an exhausted limit and still reports which credits are left', () => {
    const selection = select({
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'below',
      workspaceAllowance: 'below',
      isLimitExhausted: true,
    });

    expect(toKinds(selection.exhaustedCounters)).toEqual(['limit']);
    expect(selection.hasWorkspaceCreditsLeft).toBe(true);
    expect(selection.hasUserCreditsLeft).toBe(true);
  });

  it.each<{
    fallback: UserCreditsFallbackMode;
    userAllowance: CounterState;
    expectedKinds: QuotaCounter['kind'][];
  }>([
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'below',
      expectedKinds: [],
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'reached',
      expectedKinds: ['limit'],
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      userAllowance: 'unreadable',
      expectedKinds: ['limit'],
    },
    { fallback: 'STOP', userAllowance: 'below', expectedKinds: [] },
    {
      fallback: 'STOP',
      userAllowance: 'reached',
      expectedKinds: ['userAllowance'],
    },
  ])(
    'gates on an exhausted workspace credit limit only once the workspace pays, in $fallback mode with the userAllowance $userAllowance',
    ({ fallback, userAllowance, expectedKinds }) => {
      const userAllowanceCounter = buildUserAllowanceCounter(fallback);
      const workspaceCreditLimitCounter: LimitQuotaCounter = {
        ...limitCounter,
        key: 'workspace-credit-limit-key',
        spenderType: 'workspace',
        spenderId: null,
      };

      const selection = selectUserAllowanceFirstExhaustedCounters({
        exhaustedCounters: [
          workspaceCreditLimitCounter,
          ...(userAllowance === 'reached' ? [userAllowanceCounter] : []),
        ],
        userAllowanceCounter,
        userAllowanceConsumed: toConsumed(userAllowance, USER_ALLOWANCE_LIMIT),
        workspaceAllowanceConsumed: toConsumed(
          'below',
          WORKSPACE_ALLOWANCE_LIMIT,
        ),
      });

      expect(toKinds(selection.exhaustedCounters)).toEqual(expectedKinds);
    },
  );

  it('keeps every exhausted counter and reports no user credits without a user allowance counter', () => {
    const exhaustedCounters: QuotaCounter[] = [
      limitCounter,
      workspaceAllowanceCounter,
    ];

    expect(
      selectUserAllowanceFirstExhaustedCounters({
        exhaustedCounters,
        userAllowanceCounter: null,
        userAllowanceConsumed: null,
        workspaceAllowanceConsumed: WORKSPACE_ALLOWANCE_LIMIT,
      }),
    ).toEqual({
      exhaustedCounters,
      hasUserAllowanceCounter: false,
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: false,
    });
  });
});
