import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { findBlockingCounters } from 'src/engine/core-modules/usage-limit/utils/find-blocking-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');

const workspaceCreditLimit: LimitQuotaCounter = {
  kind: 'limit',
  isDefault: false,
  key: 'workspace-credit-limit',
  limitValue: 1_000,
  unit: UsageUnit.CREDIT,
  resourceType: UsageResourceType.AI,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
  spenderType: 'workspace',
  spenderId: null,
  operationTypes: [UsageOperationType.ALL],
};

const userCreditLimit: LimitQuotaCounter = {
  ...workspaceCreditLimit,
  key: 'user-credit-limit',
  spenderType: 'userWorkspace',
  spenderId: 'user-workspace-1',
};

const weekUserAllowance: UserAllowanceQuotaCounter = {
  ...userCreditLimit,
  kind: 'userAllowance',
  key: 'week-user-allowance',
  unit: UsageUnit.USER_CREDIT,
  periodUnit: 'week',
  periodEnd: new Date('2026-08-08T00:00:00.000Z'),
};

const dayUserAllowance: UserAllowanceQuotaCounter = {
  ...weekUserAllowance,
  key: 'day-user-allowance',
  periodUnit: 'day',
  periodEnd: new Date('2026-08-02T00:00:00.000Z'),
};

const workspaceAllowance: QuotaCounter = {
  kind: 'workspaceAllowance',
  key: 'workspace-allowance',
  limitValue: 5_000,
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
};

const { STOP, WORKSPACE_CREDITS } = UserCreditsFallback;

const allExhausted = [
  userCreditLimit,
  workspaceCreditLimit,
  workspaceAllowance,
];

describe('findBlockingCounters', () => {
  it.each<{
    title: string;
    userAllowanceConsumedValues: (number | null)[];
    userCreditsFallback: UserCreditsFallback;
    exhaustedCounters: QuotaCounter[];
    expected: QuotaCounter[];
  }>([
    {
      title: 'without a user window',
      userAllowanceConsumedValues: [],
      userCreditsFallback: WORKSPACE_CREDITS,
      exhaustedCounters: allExhausted,
      expected: [workspaceAllowance, userCreditLimit, workspaceCreditLimit],
    },
    {
      title: 'while spending user credits in spill mode',
      userAllowanceConsumedValues: [0, 0],
      userCreditsFallback: WORKSPACE_CREDITS,
      exhaustedCounters: allExhausted,
      expected: [userCreditLimit],
    },
    {
      title: 'once a user window is used up in spill mode',
      userAllowanceConsumedValues: [0, 1_000],
      userCreditsFallback: WORKSPACE_CREDITS,
      exhaustedCounters: [...allExhausted, dayUserAllowance],
      expected: [workspaceAllowance, userCreditLimit, workspaceCreditLimit],
    },
    {
      title: 'while spending user credits in STOP mode',
      userAllowanceConsumedValues: [0, 0],
      userCreditsFallback: STOP,
      exhaustedCounters: allExhausted,
      expected: [userCreditLimit],
    },
    {
      title: 'once a user window is used up in STOP mode',
      userAllowanceConsumedValues: [0, 1_000],
      userCreditsFallback: STOP,
      exhaustedCounters: [...allExhausted, dayUserAllowance],
      expected: [dayUserAllowance, userCreditLimit],
    },
    {
      title: 'when a user window was not read',
      userAllowanceConsumedValues: [0, null],
      userCreditsFallback: STOP,
      exhaustedCounters: allExhausted,
      expected: [workspaceAllowance, userCreditLimit, workspaceCreditLimit],
    },
    {
      title: 'with the user window that ends last first',
      userAllowanceConsumedValues: [1_000, 1_000],
      userCreditsFallback: STOP,
      exhaustedCounters: [dayUserAllowance, weekUserAllowance],
      expected: [weekUserAllowance, dayUserAllowance],
    },
  ])(
    'keeps the counters that block $title',
    ({
      userAllowanceConsumedValues,
      userCreditsFallback,
      exhaustedCounters,
      expected,
    }) => {
      expect(
        findBlockingCounters({
          counters: [
            ...allExhausted,
            ...[weekUserAllowance, dayUserAllowance].slice(
              0,
              userAllowanceConsumedValues.length,
            ),
          ],
          consumedValues: [1_000, 1_000, 5_000, ...userAllowanceConsumedValues],
          exhaustedCounters,
          userCreditsFallback,
        }),
      ).toEqual(expected);
    },
  );
});
