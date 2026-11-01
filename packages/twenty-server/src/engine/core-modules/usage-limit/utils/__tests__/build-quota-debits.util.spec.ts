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
  operationTypes: [UsageOperationType.ALL],
  periodUnit: 'week',
  isDefault: true,
  spenderType: 'userWorkspace',
  spenderId: 'user-workspace-1',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
};

const buildLimitCounter = (unit: UsageUnit): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: false,
  key: unit,
  limitValue: 1_000_000,
  unit,
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationTypes: [UsageOperationType.ALL],
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

const aiChatEvent: RecordUsageInput = {
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  creditsUsedMicro: 500,
  quantity: 1_200,
  unit: UsageUnit.TOKEN,
  spenders: { userWorkspaceId: 'user-workspace-1' },
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
    ).toEqual([{ counter: creditCounter, amount: 100, split: null }]);
  });

  it('debits an every-resource counter with its spender events from all resources', () => {
    const applicationId = '20202020-0000-4000-8000-000000000001';
    const allResourcesCounter: LimitQuotaCounter = {
      ...buildLimitCounter(UsageUnit.CREDIT),
      resourceType: UsageResourceType.ALL,
      spenderType: 'application',
      spenderId: applicationId,
    };

    expect(
      buildQuotaDebits({
        counters: [allResourcesCounter],
        events: [
          { ...logicFunctionEvent, spenders: { applicationId } },
          { ...workflowEvent, spenders: { applicationId } },
          {
            resourceType: UsageResourceType.APP,
            operationType: UsageOperationType.CODE_EXECUTION,
            creditsUsedMicro: 5_000,
            quantity: 1,
            unit: UsageUnit.INVOCATION,
            spenders: { applicationId },
          },
          {
            ...workflowEvent,
            spenders: { applicationId: '20202020-0000-4000-8000-000000000002' },
          },
        ],
      }),
    ).toEqual([{ counter: allResourcesCounter, amount: 5_400, split: null }]);
  });

  it('debits the allowance with the credits of every event', () => {
    expect(
      buildQuotaDebits({
        counters: [workspaceAllowanceCounter],
        events: [logicFunctionEvent, workflowEvent],
      }),
    ).toEqual([
      { counter: workspaceAllowanceCounter, amount: 400, split: null },
    ]);
  });

  it('splits the credits between the user allowance and workspace credit counters', () => {
    const workspaceCreditLimitCounter = {
      ...buildLimitCounter(UsageUnit.CREDIT),
      resourceType: UsageResourceType.AI,
    };
    const userCreditLimitCounter: LimitQuotaCounter = {
      ...workspaceCreditLimitCounter,
      key: 'user-credit-limit',
      spenderType: 'userWorkspace',
      spenderId: 'user-workspace-1',
    };

    expect(
      buildQuotaDebits({
        counters: [
          userAllowanceCounter,
          workspaceCreditLimitCounter,
          userCreditLimitCounter,
          workspaceAllowanceCounter,
        ],
        events: [aiChatEvent],
      }),
    ).toEqual([
      {
        counter: userAllowanceCounter,
        amount: 500,
        split: { kind: 'userCredits', limitValue: 1_000 },
      },
      {
        counter: workspaceCreditLimitCounter,
        amount: 500,
        split: { kind: 'workspaceCredits' },
      },
      { counter: userCreditLimitCounter, amount: 500, split: null },
      {
        counter: workspaceAllowanceCounter,
        amount: 500,
        split: { kind: 'workspaceCredits' },
      },
    ]);
  });

  it('splits nothing when the user allowance has nothing to pay', () => {
    expect(
      buildQuotaDebits({
        counters: [userAllowanceCounter, workspaceAllowanceCounter],
        events: [logicFunctionEvent],
      }),
    ).toEqual([
      { counter: workspaceAllowanceCounter, amount: 100, split: null },
    ]);
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
