import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const buildRow = (
  overrides: Partial<UsageConsumptionRow>,
): UsageConsumptionRow => ({
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  unit: UsageUnit.TOKEN,
  userWorkspaceId: 'user-1',
  apiKeyId: '',
  applicationId: '',
  agentId: '',
  workflowId: '',
  logicFunctionId: '',
  creditsUsedMicro: '100',
  quantity: '10',
  ...overrides,
});

const buildCounter = (
  overrides: Partial<LimitQuotaCounter>,
): LimitQuotaCounter => ({
  kind: 'limit',
  usageLimitId: null,
  isDefault: false,
  isEnforced: true,
  key: 'counter-key',
  limitValue: 1_000,
  unit: UsageUnit.CREDIT,
  resourceType: UsageResourceType.AI,
  periodUnit: 'month',
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
  spenderType: 'workspace',
  spenderId: null,
  operationType: UsageOperationType.ALL,
  ...overrides,
});

const rows = [
  buildRow({ agentId: 'agent-1' }),
  buildRow({
    userWorkspaceId: 'user-2',
    logicFunctionId: 'logic-function-1',
    creditsUsedMicro: '40',
  }),
  buildRow({
    operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    userWorkspaceId: '',
    workflowId: 'workflow-1',
    creditsUsedMicro: '7',
    quantity: '3',
  }),
];

describe('computeQuotaConsumed', () => {
  it('sums the credits of every operation for a credit counter on every operation', () => {
    expect(computeQuotaConsumed({ rows, scope: buildCounter({}) })).toBe(147);
  });

  it('cuts by operation when the scope names one', () => {
    expect(
      computeQuotaConsumed({
        rows,
        scope: buildCounter({
          operationType: UsageOperationType.AI_CHAT_TOKEN,
        }),
      }),
    ).toBe(140);
  });

  it('matches a named spender on its own column', () => {
    expect(
      computeQuotaConsumed({
        rows,
        scope: buildCounter({
          spenderType: 'userWorkspace',
          spenderId: 'user-2',
        }),
      }),
    ).toBe(40);
  });

  it('sums every attributed row for a shared spender counter', () => {
    expect(
      computeQuotaConsumed({
        rows,
        scope: buildCounter({
          spenderType: 'userWorkspace',
          spenderId: null,
        }),
      }),
    ).toBe(140);
  });

  it('sums the token quantity of every operation for a token counter', () => {
    expect(
      computeQuotaConsumed({
        rows,
        scope: buildCounter({ unit: UsageUnit.TOKEN }),
      }),
    ).toBe(23);
  });

  it('leaves rows of another unit out of a token counter', () => {
    expect(
      computeQuotaConsumed({
        rows: [
          ...rows,
          buildRow({
            operationType: UsageOperationType.WEB_SEARCH,
            unit: UsageUnit.INVOCATION,
            quantity: '5',
          }),
        ],
        scope: buildCounter({ unit: UsageUnit.TOKEN }),
      }),
    ).toBe(23);
  });

  it('matches a named agent on its own column', () => {
    expect(
      computeQuotaConsumed({
        rows,
        scope: buildCounter({ spenderType: 'agent', spenderId: 'agent-1' }),
      }),
    ).toBe(100);
  });

  it('matches a named workflow on its own column', () => {
    expect(
      computeQuotaConsumed({
        rows,
        scope: buildCounter({
          spenderType: 'workflow',
          spenderId: 'workflow-1',
        }),
      }),
    ).toBe(7);
  });

  it('matches a named logic function on its own column', () => {
    expect(
      computeQuotaConsumed({
        rows,
        scope: buildCounter({
          spenderType: 'logicFunction',
          spenderId: 'logic-function-1',
        }),
      }),
    ).toBe(40);
  });

  describe('when one run records an INVOCATION row and a MILLISECOND row', () => {
    const logicFunctionRunRows = [
      buildRow({
        operationType: UsageOperationType.CODE_EXECUTION,
        unit: UsageUnit.INVOCATION,
        logicFunctionId: 'logic-function-1',
        creditsUsedMicro: '3000',
        quantity: '1',
      }),
      buildRow({
        operationType: UsageOperationType.CODE_EXECUTION,
        unit: UsageUnit.MILLISECOND,
        logicFunctionId: 'logic-function-1',
        creditsUsedMicro: '150',
        quantity: '1500',
      }),
    ];

    const logicFunctionScope = buildCounter({
      operationType: UsageOperationType.CODE_EXECUTION,
      spenderType: 'logicFunction',
      spenderId: 'logic-function-1',
    });

    it('sums the credits of both units', () => {
      expect(
        computeQuotaConsumed({
          rows: logicFunctionRunRows,
          scope: logicFunctionScope,
        }),
      ).toBe(3150);
    });

    it('counts the run once on an INVOCATION counter', () => {
      expect(
        computeQuotaConsumed({
          rows: logicFunctionRunRows,
          scope: { ...logicFunctionScope, unit: UsageUnit.INVOCATION },
        }),
      ).toBe(1);
    });
  });

  it('counts the credits of a credit-unit row, never its quantity', () => {
    expect(
      computeQuotaConsumed({
        rows: [
          buildRow({
            operationType: UsageOperationType.SUBSCRIPTION,
            unit: UsageUnit.CREDIT,
            userWorkspaceId: '',
            applicationId: 'application-1',
            quantity: '1',
            creditsUsedMicro: '20000000',
          }),
        ],
        scope: buildCounter({}),
      }),
    ).toBe(20_000_000);
  });
});
