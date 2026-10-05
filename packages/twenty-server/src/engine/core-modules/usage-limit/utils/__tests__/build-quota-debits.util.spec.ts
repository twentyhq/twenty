import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildQuotaDebits } from 'src/engine/core-modules/usage-limit/utils/build-quota-debits.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');
const PERIOD_END = new Date('2026-09-01T00:00:00.000Z');
const LOGIC_FUNCTION_ID = '9f1c2b3a-4d5e-4f60-8a71-b2c3d4e5f607';
const APPLICATION_A_ID = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const APPLICATION_B_ID = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

const allowanceCounter: AllowanceQuotaCounter = {
  kind: 'allowance',
  key: 'allowance',
  unit: UsageUnit.CREDIT,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
};

const buildLimitCounter = (
  overrides: Partial<LimitQuotaCounter> & Pick<LimitQuotaCounter, 'unit'>,
): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: false,
  key: `${overrides.spenderType ?? 'workspace'}:${overrides.spenderId ?? ''}:${overrides.unit}`,
  limitValue: 1_000_000,
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationType: UsageOperationType.CODE_EXECUTION,
  periodUnit: 'month',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  spenderType: 'workspace',
  spenderId: null,
  ...overrides,
});

const buildLogicFunctionEvents = ({
  invocationCreditsMicro,
  durationCreditsMicro,
  billedDurationMs,
}: {
  invocationCreditsMicro: number;
  durationCreditsMicro: number;
  billedDurationMs: number;
}): RecordUsageInput[] => [
  {
    resourceType: UsageResourceType.LOGIC_FUNCTION,
    operationType: UsageOperationType.CODE_EXECUTION,
    creditsUsedMicro: invocationCreditsMicro,
    quantity: 1,
    unit: UsageUnit.INVOCATION,
    spenders: { logicFunctionId: LOGIC_FUNCTION_ID },
  },
  {
    resourceType: UsageResourceType.LOGIC_FUNCTION,
    operationType: UsageOperationType.CODE_EXECUTION,
    creditsUsedMicro: durationCreditsMicro,
    quantity: billedDurationMs,
    unit: UsageUnit.MILLISECOND,
    spenders: { logicFunctionId: LOGIC_FUNCTION_ID },
  },
];

const buildRecurringFeeEvent = ({
  applicationId,
  creditsUsedMicro,
  quantity,
  unit,
}: {
  applicationId: string;
  creditsUsedMicro: number;
  quantity: number;
  unit: UsageUnit;
}): RecordUsageInput => ({
  resourceType: UsageResourceType.APP,
  operationType: UsageOperationType.SUBSCRIPTION,
  creditsUsedMicro,
  quantity,
  unit,
  spenders: { applicationId },
});

describe('buildQuotaDebits', () => {
  it('debits credit counters with the credits and unit counters with the quantity recorded in their unit', () => {
    const creditCounter = buildLimitCounter({ unit: UsageUnit.CREDIT });
    const invocationCounter = buildLimitCounter({
      unit: UsageUnit.INVOCATION,
    });

    expect(
      buildQuotaDebits({
        counters: [allowanceCounter, creditCounter, invocationCounter],
        events: buildLogicFunctionEvents({
          invocationCreditsMicro: 100,
          durationCreditsMicro: 1_500,
          billedDurationMs: 15_000,
        }),
      }),
    ).toEqual([
      { counter: allowanceCounter, amount: 1_600 },
      { counter: creditCounter, amount: 1_600 },
      { counter: invocationCounter, amount: 1 },
    ]);
  });

  it('debits only the run counter for an exempt run, leaving the allowance alone', () => {
    const invocationCounter = buildLimitCounter({
      unit: UsageUnit.INVOCATION,
    });

    expect(
      buildQuotaDebits({
        counters: [allowanceCounter, invocationCounter],
        events: buildLogicFunctionEvents({
          invocationCreditsMicro: 0,
          durationCreditsMicro: 0,
          billedDurationMs: 0,
        }),
      }),
    ).toEqual([{ counter: invocationCounter, amount: 1 }]);
  });

  it('debits a flat fee recorded in CREDIT by its credits, never adding its quantity', () => {
    expect(
      buildQuotaDebits({
        counters: [allowanceCounter],
        events: [
          buildRecurringFeeEvent({
            applicationId: APPLICATION_A_ID,
            creditsUsedMicro: 20_000_000,
            quantity: 1,
            unit: UsageUnit.CREDIT,
          }),
        ],
      }),
    ).toEqual([{ counter: allowanceCounter, amount: 20_000_000 }]);
  });

  it('sums the allowance across events of different scopes', () => {
    expect(
      buildQuotaDebits({
        counters: [allowanceCounter],
        events: [
          buildRecurringFeeEvent({
            applicationId: APPLICATION_A_ID,
            creditsUsedMicro: 20_000_000,
            quantity: 1,
            unit: UsageUnit.CREDIT,
          }),
          buildRecurringFeeEvent({
            applicationId: APPLICATION_B_ID,
            creditsUsedMicro: 15_000_000,
            quantity: 3,
            unit: UsageUnit.SEAT,
          }),
        ],
      }),
    ).toEqual([{ counter: allowanceCounter, amount: 35_000_000 }]);
  });

  it('debits a spender counter only with the events of that spender', () => {
    const applicationACounter = buildLimitCounter({
      unit: UsageUnit.CREDIT,
      resourceType: UsageResourceType.WORKFLOW,
      operationType: UsageOperationType.WORKFLOW_EXECUTION,
      spenderType: 'application',
      spenderId: APPLICATION_A_ID,
    });

    expect(
      buildQuotaDebits({
        counters: [applicationACounter],
        events: [APPLICATION_A_ID, APPLICATION_B_ID].map((applicationId) => ({
          resourceType: UsageResourceType.WORKFLOW,
          operationType: UsageOperationType.WORKFLOW_EXECUTION,
          creditsUsedMicro: 100,
          quantity: 1,
          unit: UsageUnit.INVOCATION,
          spenders: { applicationId },
        })),
      }),
    ).toEqual([{ counter: applicationACounter, amount: 100 }]);
  });

  it('leaves a limit counter alone for events of another resource type', () => {
    expect(
      buildQuotaDebits({
        counters: [buildLimitCounter({ unit: UsageUnit.CREDIT })],
        events: [
          buildRecurringFeeEvent({
            applicationId: APPLICATION_A_ID,
            creditsUsedMicro: 20_000_000,
            quantity: 1,
            unit: UsageUnit.CREDIT,
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('counts missing or invalid credits as zero, as the recorder stores them', () => {
    expect(
      buildQuotaDebits({
        counters: [allowanceCounter],
        events: [
          {
            resourceType: UsageResourceType.LOGIC_FUNCTION,
            operationType: UsageOperationType.CODE_EXECUTION,
            quantity: 1,
            unit: UsageUnit.INVOCATION,
          },
          ...buildLogicFunctionEvents({
            invocationCreditsMicro: 100,
            durationCreditsMicro: Number.NaN,
            billedDurationMs: 15_000,
          }),
        ],
      }),
    ).toEqual([{ counter: allowanceCounter, amount: 100 }]);
  });

  it('drops a counter whose summed quantity is not a safe positive integer', () => {
    expect(
      buildQuotaDebits({
        counters: [buildLimitCounter({ unit: UsageUnit.INVOCATION })],
        events: [
          {
            resourceType: UsageResourceType.LOGIC_FUNCTION,
            operationType: UsageOperationType.CODE_EXECUTION,
            creditsUsedMicro: 100,
            quantity: -1,
            unit: UsageUnit.INVOCATION,
          },
        ],
      }),
    ).toEqual([]);
  });

  it('debits nothing for no events', () => {
    expect(
      buildQuotaDebits({ counters: [allowanceCounter], events: [] }),
    ).toEqual([]);
  });
});
