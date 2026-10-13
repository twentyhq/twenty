import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type MemberAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/member-allowance-quota-counter.type';
import { type MemberCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/member-credits-fallback-mode.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { selectMemberFirstExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/select-member-first-exhausted-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');
const MEMBER_LIMIT = 1_000;
const ALLOWANCE_LIMIT = 5_000;

type CounterState = 'below' | 'reached' | 'unreadable';

type ExpectedKind = 'allowance' | 'memberAllowance' | 'limit' | null;

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

const allowanceCounter: AllowanceQuotaCounter = {
  kind: 'allowance',
  key: 'allowance-key',
  limitValue: ALLOWANCE_LIMIT,
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
};

const buildMemberCounter = (
  fallback: MemberCreditsFallbackMode,
): MemberAllowanceQuotaCounter => ({
  kind: 'memberAllowance',
  key: 'member-allowance-key',
  limitValue: MEMBER_LIMIT,
  unit: UsageUnit.CREDIT,
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

// Mirrors findExhaustedCounters: an unreadable counter is never exhausted
const select = ({
  fallback,
  member,
  allowance,
  isLimitExhausted = false,
}: {
  fallback: MemberCreditsFallbackMode;
  member: CounterState;
  allowance: CounterState;
  isLimitExhausted?: boolean;
}) => {
  const memberCounter = buildMemberCounter(fallback);
  const exhaustedCounters: QuotaCounter[] = [
    ...(isLimitExhausted ? [limitCounter] : []),
    ...(allowance === 'reached' ? [allowanceCounter] : []),
    ...(member === 'reached' ? [memberCounter] : []),
  ];

  return selectMemberFirstExhaustedCounters({
    exhaustedCounters,
    memberCounter,
    memberConsumed: toConsumed(member, MEMBER_LIMIT),
    allowanceConsumed: toConsumed(allowance, ALLOWANCE_LIMIT),
  });
};

const toKinds = (counters: QuotaCounter[]) =>
  counters.map((counter) => counter.kind);

describe('selectMemberFirstExhaustedCounters', () => {
  describe.each<{
    fallback: MemberCreditsFallbackMode;
    member: CounterState;
    allowance: CounterState;
    expectedKind: ExpectedKind;
    isMemberAllowanceAvailable: boolean;
    isWorkspaceAllowanceAvailable: boolean | null;
  }>([
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'below',
      allowance: 'below',
      expectedKind: null,
      isMemberAllowanceAvailable: true,
      isWorkspaceAllowanceAvailable: true,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'below',
      allowance: 'reached',
      expectedKind: null,
      isMemberAllowanceAvailable: true,
      isWorkspaceAllowanceAvailable: false,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'below',
      allowance: 'unreadable',
      expectedKind: null,
      isMemberAllowanceAvailable: true,
      isWorkspaceAllowanceAvailable: false,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'reached',
      allowance: 'below',
      expectedKind: null,
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: true,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'reached',
      allowance: 'reached',
      expectedKind: 'allowance',
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: null,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'reached',
      allowance: 'unreadable',
      expectedKind: null,
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: true,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'unreadable',
      allowance: 'below',
      expectedKind: null,
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: true,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'unreadable',
      allowance: 'reached',
      expectedKind: 'allowance',
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: null,
    },
    {
      fallback: 'WORKSPACE_CREDITS',
      member: 'unreadable',
      allowance: 'unreadable',
      expectedKind: null,
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: true,
    },
    {
      fallback: 'STOP',
      member: 'reached',
      allowance: 'below',
      expectedKind: 'memberAllowance',
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: null,
    },
    {
      fallback: 'STOP',
      member: 'reached',
      allowance: 'reached',
      expectedKind: 'memberAllowance',
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: null,
    },
    {
      fallback: 'STOP',
      member: 'reached',
      allowance: 'unreadable',
      expectedKind: 'memberAllowance',
      isMemberAllowanceAvailable: false,
      isWorkspaceAllowanceAvailable: null,
    },
  ])(
    'in $fallback mode with the member $member and the allowance $allowance',
    ({
      fallback,
      member,
      allowance,
      expectedKind,
      isMemberAllowanceAvailable,
      isWorkspaceAllowanceAvailable,
    }) => {
      it(
        expectedKind === null ? 'admits' : `refuses on ${expectedKind}`,
        () => {
          expect(
            toKinds(select({ fallback, member, allowance }).exhaustedCounters),
          ).toEqual(expectedKind === null ? [] : [expectedKind]);
        },
      );

      it('reports a member counter and both availability flags', () => {
        expect(select({ fallback, member, allowance })).toMatchObject({
          hasMemberCounter: true,
          isMemberAllowanceAvailable,
          isWorkspaceAllowanceAvailable,
        });
      });
    },
  );

  it('keeps an exhausted limit and then reports no workspace flag', () => {
    const selection = select({
      fallback: 'WORKSPACE_CREDITS',
      member: 'below',
      allowance: 'below',
      isLimitExhausted: true,
    });

    expect(toKinds(selection.exhaustedCounters)).toEqual(['limit']);
    expect(selection.isWorkspaceAllowanceAvailable).toBeNull();
    expect(selection.isMemberAllowanceAvailable).toBe(true);
  });

  it('keeps every exhausted counter and reports no flags without a member counter', () => {
    const exhaustedCounters: QuotaCounter[] = [limitCounter, allowanceCounter];

    expect(
      selectMemberFirstExhaustedCounters({
        exhaustedCounters,
        memberCounter: null,
        memberConsumed: null,
        allowanceConsumed: ALLOWANCE_LIMIT,
      }),
    ).toEqual({
      exhaustedCounters,
      hasMemberCounter: false,
      isMemberAllowanceAvailable: null,
      isWorkspaceAllowanceAvailable: null,
    });
  });
});
