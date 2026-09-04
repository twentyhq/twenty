import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const MONTH_PERIOD = {
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
};

const WEEK_PERIOD = {
  periodStart: new Date('2026-08-24T00:00:00.000Z'),
  periodEnd: new Date('2026-08-31T00:00:00.000Z'),
};

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValueType: 'absolute',
  limitValue: 1_000_000,
  burstValue: null,
  ...overrides,
});

const ALLOWANCE_PERIOD = {
  periodStart: new Date('2026-08-15T09:00:00.000Z'),
  periodEnd: new Date('2026-09-15T09:00:00.000Z'),
};

const buildCounters = ({ limits }: { limits: FlatUsageLimit[] }) =>
  buildQuotaCounters({
    limits,
    usageSpenders: { userWorkspaceId: 'user-1' },
    workspaceId: 'workspace-1',
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    periodByUnit: {
      month: MONTH_PERIOD,
      week: WEEK_PERIOD,
      allowancePeriod: ALLOWANCE_PERIOD,
    },
  });

describe('buildQuotaCounters', () => {
  it('builds one counter per matching limit with a period-scoped key', () => {
    const counters = buildCounters({
      limits: [buildLimit({ spenderType: 'workspace' })],
    });

    expect(counters).toEqual([
      {
        kind: 'limit',
        key: `{workspace-1}:quota:AI:AI_CHAT_TOKEN:workspace:-:creditsUsedMicro:month:${MONTH_PERIOD.periodStart.getTime()}`,
        limitValueType: 'absolute',
        limitValue: 1_000_000,
        meter: 'creditsUsedMicro',
        resourceType: UsageResourceType.AI,
        periodUnit: 'month',
        periodStart: MONTH_PERIOD.periodStart,
        periodEnd: MONTH_PERIOD.periodEnd,
        spenderType: 'workspace',
        spenderId: null,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
      },
    ]);
  });

  it('anchors each counter to its own period unit', () => {
    const counters = buildCounters({
      limits: [
        buildLimit({ id: 'monthly' }),
        buildLimit({ id: 'weekly', periodUnit: 'week' }),
      ],
    });

    expect(counters.map((counter) => counter.periodStart)).toEqual([
      MONTH_PERIOD.periodStart,
      WEEK_PERIOD.periodStart,
    ]);
  });

  it('ignores limits for spenders absent from the call', () => {
    const counters = buildCounters({
      limits: [buildLimit({ spenderType: 'apiKey', spenderId: 'key-1' })],
    });

    expect(counters).toEqual([]);
  });

  it('applies a wildcard-operation limit alongside the operation-scoped one', () => {
    const counters = buildCounters({
      limits: [
        buildLimit({ id: 'all', operationType: UsageOperationType.ALL }),
        buildLimit({ id: 'chat' }),
      ],
    });

    expect(counters.map((counter) => counter.operationType)).toEqual([
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.ALL,
    ]);
  });

  it('ranks a named user counter before workspace counters', () => {
    const counters = buildCounters({
      limits: [
        buildLimit({ spenderType: 'workspace' }),
        buildLimit({
          id: 'limit-2',
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
        }),
      ],
    });

    expect(counters.map((counter) => counter.spenderType)).toEqual([
      'userWorkspace',
      'workspace',
    ]);
  });

  it('keys a percent limit on the allowance period and keeps the percent', () => {
    const counters = buildCounters({
      limits: [
        buildLimit({
          periodUnit: 'allowancePeriod',
          limitValueType: 'allowancePercent',
          limitValue: 40,
        }),
      ],
    });

    expect(counters).toMatchObject([
      {
        key: `{workspace-1}:quota:AI:AI_CHAT_TOKEN:workspace:-:creditsUsedMicro:allowancePeriod:${ALLOWANCE_PERIOD.periodStart.getTime()}`,
        limitValueType: 'allowancePercent',
        limitValue: 40,
        periodStart: ALLOWANCE_PERIOD.periodStart,
        periodEnd: ALLOWANCE_PERIOD.periodEnd,
      },
    ]);
  });

  it('skips a limit whose period was not resolved', () => {
    const counters = buildCounters({
      limits: [buildLimit({ periodUnit: 'day' })],
    });

    expect(counters).toEqual([]);
  });

  it('does not match a limit for another operation', () => {
    const counters = buildCounters({
      limits: [
        buildLimit({ operationType: UsageOperationType.AI_WORKFLOW_TOKEN }),
      ],
    });

    expect(counters).toEqual([]);
  });
});
