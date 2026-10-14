import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { buildQuotaDebits } from 'src/engine/core-modules/usage-limit/utils/build-quota-debits.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');

const workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter = {
  kind: 'workspaceAllowance',
  key: 'workspaceAllowance',
  limitValue: 1_000_000,
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
};

const userAllowanceCounter: UserAllowanceQuotaCounter = {
  kind: 'userAllowance',
  key: 'user-allowance',
  limitValue: 1_000,
  unit: UsageUnit.USER_CREDIT,
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  periodUnit: 'week',
  userWorkspaceId: 'user-workspace-1',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  fallback: 'WORKSPACE_CREDITS',
};

const buildLimitCounter = (unit: UsageUnit): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: false,
  key: unit,
  limitValue: 1_000_000,
  unit,
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationType: UsageOperationType.ALL,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'workspace',
  spenderId: null,
});

const logicFunctionEvent: RecordUsageInput = {
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationType: UsageOperationType.CODE_EXECUTION,
  creditsUsedMicro: 100,
  quantity: 1,
  unit: UsageUnit.INVOCATION,
};

const workflowEvent: RecordUsageInput = {
  resourceType: UsageResourceType.WORKFLOW,
  operationType: UsageOperationType.WORKFLOW_EXECUTION,
  creditsUsedMicro: 300,
  quantity: 1,
  unit: UsageUnit.INVOCATION,
};

describe('buildQuotaDebits', () => {
  it('debits a limit counter with the events of its resource type only', () => {
    const creditCounter = buildLimitCounter(UsageUnit.CREDIT);

    expect(
      buildQuotaDebits({
        counters: [creditCounter],
        events: [logicFunctionEvent, workflowEvent],
      }),
    ).toEqual([{ counter: creditCounter, amount: 100 }]);
  });

  it('debits the allowance with the credits of every event', () => {
    expect(
      buildQuotaDebits({
        counters: [workspaceAllowanceCounter],
        events: [logicFunctionEvent, workflowEvent],
      }),
    ).toEqual([{ counter: workspaceAllowanceCounter, amount: 400 }]);
  });

  it('never debits a user allowance counter', () => {
    expect(
      buildQuotaDebits({
        counters: [userAllowanceCounter, workspaceAllowanceCounter],
        events: [logicFunctionEvent],
      }),
    ).toEqual([{ counter: workspaceAllowanceCounter, amount: 100 }]);
  });

  it('drops a counter the events consume nothing of', () => {
    expect(
      buildQuotaDebits({
        counters: [workspaceAllowanceCounter],
        events: [{ ...logicFunctionEvent, creditsUsedMicro: 0 }],
      }),
    ).toEqual([]);
  });

  it('drops a counter whose amount is not a whole number', () => {
    expect(
      buildQuotaDebits({
        counters: [buildLimitCounter(UsageUnit.INVOCATION)],
        events: [{ ...logicFunctionEvent, quantity: 1.5 }],
      }),
    ).toEqual([]);
  });
});
