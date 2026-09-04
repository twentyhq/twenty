import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildRow = (
  overrides: Partial<QuotaConsumptionRow>,
): QuotaConsumptionRow => ({
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
  it('sums every row for a workspace counter with no operation', () => {
    expect(computeQuotaConsumed({ rows, counter: buildCounter({}) })).toBe(147);
  });

  it('cuts by operation when the counter names one', () => {
    expect(
      computeQuotaConsumed({
        rows,
        counter: buildCounter({
          operationType: UsageOperationType.AI_CHAT_TOKEN,
        }),
      }),
    ).toBe(140);
  });

  it('matches a named spender on its own column', () => {
    expect(
      computeQuotaConsumed({
        rows,
        counter: buildCounter({
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
        counter: buildCounter({
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
        counter: buildCounter({ meter: 'quantity' }),
      }),
    ).toBe(23);
  });

  it('matches a named agent on its own column', () => {
    expect(
      computeQuotaConsumed({
        rows,
        counter: buildCounter({ spenderType: 'agent', spenderId: 'agent-1' }),
      }),
    ).toBe(100);
  });

  it('matches a named workflow on its own column', () => {
    expect(
      computeQuotaConsumed({
        rows,
        counter: buildCounter({
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
        counter: buildCounter({
          spenderType: 'logicFunction',
          spenderId: 'logic-function-1',
        }),
      }),
    ).toBe(40);
  });
});
