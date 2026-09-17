import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildRow = (
  overrides: Partial<UsageConsumptionRow>,
): UsageConsumptionRow => ({
  operationType: UsageOperationType.AI_CHAT_TOKEN,
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
  key: 'counter-key',
  limitValue: 1_000,
  meter: 'creditsUsedMicro',
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
  it('sums every row for a workspace scope with no operation', () => {
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

  it('sums the quantity column when the counter meters on it', () => {
    expect(
      computeQuotaConsumed({
        rows,
        scope: buildCounter({ meter: 'quantity' }),
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
});
