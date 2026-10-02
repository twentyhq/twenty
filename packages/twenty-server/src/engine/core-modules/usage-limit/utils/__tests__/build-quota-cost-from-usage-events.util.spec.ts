import { buildQuotaCostFromUsageEvents } from 'src/engine/core-modules/usage-limit/utils/build-quota-cost-from-usage-events.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';

const LOGIC_FUNCTION_SPENDERS = {
  logicFunctionId: 'logic-function-1',
  applicationId: 'application-1',
};

const logicFunctionRunEvents: RecordUsageInput[] = [
  {
    resourceType: UsageResourceType.LOGIC_FUNCTION,
    operationType: UsageOperationType.CODE_EXECUTION,
    creditsUsedMicro: 100,
    quantity: 1,
    unit: UsageUnit.INVOCATION,
    resourceId: 'logic-function-1',
    spenders: LOGIC_FUNCTION_SPENDERS,
  },
  {
    resourceType: UsageResourceType.LOGIC_FUNCTION,
    operationType: UsageOperationType.CODE_EXECUTION,
    creditsUsedMicro: 1_500,
    quantity: 15_000,
    unit: UsageUnit.MILLISECOND,
    resourceId: 'logic-function-1',
    spenders: LOGIC_FUNCTION_SPENDERS,
  },
];

const flatChargeEvents: RecordUsageInput[] = [
  {
    resourceType: UsageResourceType.APP,
    operationType: UsageOperationType.SUBSCRIPTION,
    creditsUsedMicro: 20_000_000,
    quantity: 1,
    unit: UsageUnit.CREDIT,
    resourceId: 'application-1',
    spenders: { applicationId: 'application-1' },
  },
];

const buildConsumptionRow = (
  usageEvent: RecordUsageInput,
): UsageConsumptionRow => ({
  operationType: usageEvent.operationType,
  unit: usageEvent.unit,
  userWorkspaceId: usageEvent.spenders?.userWorkspaceId ?? '',
  apiKeyId: usageEvent.spenders?.apiKeyId ?? '',
  applicationId: usageEvent.spenders?.applicationId ?? '',
  agentId: usageEvent.spenders?.agentId ?? '',
  workflowId: usageEvent.spenders?.workflowId ?? '',
  logicFunctionId: usageEvent.spenders?.logicFunctionId ?? '',
  creditsUsedMicro: String(usageEvent.creditsUsedMicro ?? 0),
  quantity: String(usageEvent.quantity),
});

describe('buildQuotaCostFromUsageEvents', () => {
  it('costs a logic function run in credits, runs and runtime', () => {
    expect(buildQuotaCostFromUsageEvents(logicFunctionRunEvents)).toEqual({
      [UsageUnit.CREDIT]: 1_600,
      [UsageUnit.INVOCATION]: 1,
      [UsageUnit.MILLISECOND]: 15_000,
    });
  });

  it('adds only the credits of a credit-unit event, never its quantity', () => {
    expect(buildQuotaCostFromUsageEvents(flatChargeEvents)).toEqual({
      [UsageUnit.CREDIT]: 20_000_000,
    });
  });

  it('sums the quantities of events sharing a unit', () => {
    expect(
      buildQuotaCostFromUsageEvents([
        ...logicFunctionRunEvents,
        ...logicFunctionRunEvents,
      ]),
    ).toEqual({
      [UsageUnit.CREDIT]: 3_200,
      [UsageUnit.INVOCATION]: 2,
      [UsageUnit.MILLISECOND]: 30_000,
    });
  });

  it('counts an event without credits as zero credits', () => {
    expect(
      buildQuotaCostFromUsageEvents([
        {
          resourceType: UsageResourceType.WORKFLOW,
          operationType: UsageOperationType.WORKFLOW_EXECUTION,
          quantity: 1,
          unit: UsageUnit.INVOCATION,
        },
      ]),
    ).toEqual({ [UsageUnit.CREDIT]: 0, [UsageUnit.INVOCATION]: 1 });
  });

  it('states zero credits for no event', () => {
    expect(buildQuotaCostFromUsageEvents([])).toEqual({
      [UsageUnit.CREDIT]: 0,
    });
  });

  describe.each([
    ['a logic function run', logicFunctionRunEvents],
    ['a flat charge', flatChargeEvents],
  ])('for %s', (_label, usageEvents) => {
    it.each(Object.values(UsageUnit))(
      'debits live the %s a rebuild from the recorded rows counts',
      (unit) => {
        const cost = buildQuotaCostFromUsageEvents(usageEvents);

        expect(
          computeQuotaConsumed({
            rows: usageEvents.map(buildConsumptionRow),
            scope: {
              operationType: usageEvents[0].operationType,
              spenderType: 'workspace',
              spenderId: null,
              unit,
            },
          }),
        ).toBe(cost[unit] ?? 0);
      },
    );
  });
});
