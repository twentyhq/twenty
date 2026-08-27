import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type QuotaCounterRequest } from 'src/engine/core-modules/usage-limit/types/quota-counter-request.type';
import { type UsageCell } from 'src/engine/core-modules/usage-limit/types/usage-cell.type';
import { sumUsageForQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/sum-usage-for-quota-counter.util';

const buildCell = (overrides: Partial<UsageCell>): UsageCell => ({
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  userWorkspaceId: '',
  apiKeyId: '',
  applicationId: '',
  agentId: '',
  workflowId: '',
  logicFunctionId: '',
  total: 0,
  ...overrides,
});

// One warm query for the whole workspace, projected onto counters of
// different scopes.
const cells: UsageCell[] = [
  buildCell({
    userWorkspaceId: 'user-1',
    agentId: 'agent-1',
    total: 100,
  }),
  buildCell({
    userWorkspaceId: 'user-2',
    total: 30,
  }),
  buildCell({
    operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    agentId: 'agent-1',
    total: 7,
  }),
];

const buildCounter = (
  overrides: Partial<QuotaCounterRequest>,
): QuotaCounterRequest => ({
  key: 'key',
  limitValue: 1_000,
  resourceType: UsageResourceType.AI,
  operationType: '',
  spenderType: 'workspace',
  spenderId: null,
  meter: 'creditsUsedMicro',
  isFallback: false,
  ...overrides,
});

describe('sumUsageForQuotaCounter', () => {
  it('sums every cell for a workspace-wide counter', () => {
    expect(sumUsageForQuotaCounter({ counter: buildCounter({}), cells })).toBe(
      137,
    );
  });

  it('sums one operation for an operation-scoped counter', () => {
    expect(
      sumUsageForQuotaCounter({
        counter: buildCounter({
          operationType: UsageOperationType.AI_CHAT_TOKEN,
        }),
        cells,
      }),
    ).toBe(130);
  });

  it('sums one member for a member-scoped counter', () => {
    expect(
      sumUsageForQuotaCounter({
        counter: buildCounter({
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
        }),
        cells,
      }),
    ).toBe(100);
  });

  it('excludes userless usage from a pooled member counter', () => {
    expect(
      sumUsageForQuotaCounter({
        counter: buildCounter({
          spenderType: 'userWorkspace',
          spenderId: null,
        }),
        cells,
      }),
    ).toBe(130);
  });

  it('returns zero when the period has no usage', () => {
    expect(
      sumUsageForQuotaCounter({ counter: buildCounter({}), cells: [] }),
    ).toBe(0);
  });

  it('sums one agent across operations for an agent-scoped counter', () => {
    expect(
      sumUsageForQuotaCounter({
        counter: buildCounter({ spenderType: 'agent', spenderId: 'agent-1' }),
        cells,
      }),
    ).toBe(107);
  });

  it('excludes agentless usage from a pooled agent counter', () => {
    expect(
      sumUsageForQuotaCounter({
        counter: buildCounter({ spenderType: 'agent', spenderId: null }),
        cells,
      }),
    ).toBe(107);
  });
});
