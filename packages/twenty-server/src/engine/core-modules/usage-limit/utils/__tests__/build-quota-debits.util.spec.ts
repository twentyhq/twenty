import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildQuotaDebits } from 'src/engine/core-modules/usage-limit/utils/build-quota-debits.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');

const allowanceCounter: AllowanceQuotaCounter = {
  kind: 'allowance',
  key: 'allowance',
  unit: UsageUnit.CREDIT,
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

const paidChatEvent: RecordUsageInput = {
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  creditsUsedMicro: 200,
  quantity: 20,
  unit: UsageUnit.TOKEN,
};

const includedChatEvent: RecordUsageInput = {
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_INCLUDED,
  creditsUsedMicro: 700,
  quantity: 70,
  unit: UsageUnit.TOKEN,
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
        counters: [allowanceCounter],
        events: [logicFunctionEvent, workflowEvent],
      }),
    ).toEqual([{ counter: allowanceCounter, amount: 400 }]);
  });

  it('debits the allowance with paid chat only in a batch mixing paid and included chat', () => {
    const includedChatCounter: LimitQuotaCounter = {
      ...buildLimitCounter(UsageUnit.CREDIT),
      key: 'included-chat',
      isDefault: true,
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
      periodUnit: 'day',
    };

    expect(
      buildQuotaDebits({
        counters: [allowanceCounter, includedChatCounter],
        events: [paidChatEvent, includedChatEvent],
      }),
    ).toEqual([
      { counter: allowanceCounter, amount: 200 },
      { counter: includedChatCounter, amount: 700 },
    ]);
  });

  it('debits nothing from the allowance for included chat alone', () => {
    expect(
      buildQuotaDebits({
        counters: [allowanceCounter],
        events: [includedChatEvent],
      }),
    ).toEqual([]);
  });

  it('drops a counter the events consume nothing of', () => {
    expect(
      buildQuotaDebits({
        counters: [allowanceCounter],
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
