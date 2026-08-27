import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type UsageLimitDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';

const AI_QUOTA_DEFINITION: UsageLimitDefinition = {
  allowedOperationTypes: [
    UsageOperationType.AI_CHAT_TOKEN,
    UsageOperationType.AI_WORKFLOW_TOKEN,
    UsageOperationType.WEB_SEARCH,
  ],
  allowedSpenderTypes: ['workspace', 'userWorkspace'],
  fallbacks: [{ source: 'allowance', spenderType: 'workspace' }],
  meters: 'creditsUsedMicro',
};

const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');

const buildRule = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'rule-id',
  resourceType: UsageResourceType.AI,
  operationType: '',
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  windowSeconds: 0,
  limitValueType: 'absolute',
  limitValue: 500_000,
  burstValue: null,
  ...overrides,
});

const buildCounters = ({
  rules = [],
  allowance = null,
  userWorkspaceId = 'user-1',
}: {
  rules?: FlatUsageLimit[];
  allowance?: number | null;
  userWorkspaceId?: string | null;
} = {}) =>
  buildQuotaCounters({
    definition: AI_QUOTA_DEFINITION,
    rules,
    workspaceId: 'workspace-1',
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    spenders: { userWorkspaceId },
    allowance,
    periodStart: PERIOD_START,
  });

describe('buildQuotaCounters', () => {
  it('keys a counter on its full scope and the period start', () => {
    const counters = buildCounters({
      rules: [buildRule({ operationType: UsageOperationType.AI_CHAT_TOKEN })],
    });

    expect(counters).toHaveLength(1);
    expect(counters[0].key).toBe(
      `{workspace-1}:quota:AI:AI_CHAT_TOKEN:workspace:-:${PERIOD_START.getTime()}`,
    );
  });

  it('keys a wildcard-operation counter with the ALL sentinel', () => {
    const counters = buildCounters({ rules: [buildRule({})] });

    expect(counters[0].key).toBe(
      `{workspace-1}:quota:AI:ALL:workspace:-:${PERIOD_START.getTime()}`,
    );
  });

  it('resolves a percent rule against the allowance in basis points', () => {
    const counters = buildCounters({
      rules: [buildRule({ limitValueType: 'percent', limitValue: 2_500 })],
      allowance: 1_000_000,
    });

    const ruleCounter = counters.find((counter) => !counter.isFallback);

    expect(ruleCounter?.limitValue).toBe(250_000);
  });

  it('drops a percent rule when nothing bounds the workspace', () => {
    const counters = buildCounters({
      rules: [buildRule({ limitValueType: 'percent', limitValue: 2_500 })],
      allowance: null,
    });

    expect(counters).toHaveLength(0);
  });

  it('adds the allowance as a cross-resource fallback counter', () => {
    const counters = buildCounters({ allowance: 1_000_000 });

    expect(counters).toEqual([
      expect.objectContaining({
        key: `{workspace-1}:quota:ALL:ALL:workspace:-:${PERIOD_START.getTime()}`,
        limitValue: 1_000_000,
        resourceType: '',
        operationType: '',
        spenderType: 'workspace',
        meter: 'creditsUsedMicro',
        isFallback: true,
      }),
    ]);
  });

  it('builds no counters when there are no rules and no allowance', () => {
    expect(buildCounters()).toEqual([]);
  });

  it('orders counters narrowest first, ending on the allowance', () => {
    const counters = buildCounters({
      rules: [
        buildRule({ id: 'workspace-wide' }),
        buildRule({
          id: 'member',
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
          limitValue: 100_000,
        }),
        buildRule({
          id: 'member-chat',
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          limitValue: 50_000,
        }),
      ],
      allowance: 1_000_000,
    });

    expect(
      counters.map((counter) => [
        counter.spenderType,
        counter.operationType,
        counter.isFallback,
      ]),
    ).toEqual([
      ['userWorkspace', UsageOperationType.AI_CHAT_TOKEN, false],
      ['userWorkspace', '', false],
      ['workspace', '', false],
      ['workspace', '', true],
    ]);
  });

  it('ignores spender types the definition does not allow', () => {
    const counters = buildQuotaCounters({
      definition: AI_QUOTA_DEFINITION,
      rules: [
        buildRule({ spenderType: 'agent', spenderId: 'agent-1' }),
        buildRule({ id: 'member', spenderType: 'userWorkspace' }),
      ],
      workspaceId: 'workspace-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      spenders: { userWorkspaceId: 'user-1', agentId: 'agent-1' },
      allowance: null,
      periodStart: PERIOD_START,
    });

    expect(counters).toHaveLength(1);
    expect(counters[0].spenderType).toBe('userWorkspace');
  });
});
