import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
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

const buildLimit = (overrides: Partial<FlatQuotaLimit>): FlatQuotaLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValue: 1_000_000,
  burstValue: null,
  isInstanceOverride: false,
  ...overrides,
});

const buildDefault = (
  overrides: Partial<QuotaLimitDefault> = {},
): QuotaLimitDefault => ({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  limitKind: 'quota',
  spenderType: 'workspace',
  spenderId: '',
  meter: 'creditsUsedMicro',
  periodUnit: 'month',
  periodCount: 1,
  isOverridable: true,
  limitValue: 5_000,
  ...overrides,
});

const buildCounters = ({
  limits = [],
  quotaLimitDefaults = [],
}: {
  limits?: FlatQuotaLimit[];
  quotaLimitDefaults?: QuotaLimitDefault[];
}) =>
  buildQuotaCounters({
    limits,
    quotaLimitDefaults,
    usageSpenders: { userWorkspaceId: 'user-1' },
    workspaceId: 'workspace-1',
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    periodByUnit: { month: MONTH_PERIOD, week: WEEK_PERIOD },
  });

describe('buildQuotaCounters', () => {
  it('builds one counter per matching limit with a period-scoped key', () => {
    const counters = buildCounters({
      limits: [buildLimit({ spenderType: 'workspace' })],
    });

    expect(counters).toEqual([
      {
        kind: 'limit',
        isDefault: false,
        key: `{workspace-1}:quota:AI:AI_CHAT_TOKEN:workspace:-:creditsUsedMicro:month:${MONTH_PERIOD.periodStart.getTime()}`,
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

  it('caps the workspace with the default when no limit is stored', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [buildDefault()],
    });

    expect(counters).toEqual([
      {
        kind: 'limit',
        isDefault: true,
        key: `{workspace-1}:quota:AI:AI_CHAT_TOKEN:workspace:-:creditsUsedMicro:month:${MONTH_PERIOD.periodStart.getTime()}:default:5000`,
        limitValue: 5_000,
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

  it.each([500, 50_000])(
    'overrides the default with a workspace limit of %i',
    (limitValue) => {
      const counters = buildCounters({
        limits: [buildLimit({ limitValue })],
        quotaLimitDefaults: [buildDefault()],
      });

      expect(counters).toEqual([
        expect.objectContaining({ isDefault: false, limitValue }),
      ]);
    },
  );

  it('keeps a non-overridable default alongside a stored limit', () => {
    const counters = buildCounters({
      limits: [buildLimit({})],
      quotaLimitDefaults: [buildDefault({ isOverridable: false })],
    });

    expect(counters.map((counter) => counter.isDefault)).toEqual([false, true]);
    expect(new Set(counters.map((counter) => counter.key)).size).toBe(2);
  });

  it.each([
    { spenderType: 'userWorkspace' as const, spenderId: 'user-1' },
    { meter: 'quantity' as const },
  ])('preserves the default for a different scope: %j', (overrides) => {
    const counters = buildCounters({
      limits: [buildLimit(overrides)],
      quotaLimitDefaults: [buildDefault()],
    });

    expect(counters.map((counter) => counter.isDefault)).toEqual([false, true]);
  });

  it('skips a default whose period was not resolved', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [buildDefault({ periodUnit: 'day' })],
    });

    expect(counters).toEqual([]);
  });

  it('ignores a default for a spender type absent from the call', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [buildDefault({ spenderType: 'apiKey' })],
    });

    expect(counters).toEqual([]);
  });

  it('preserves the default against a row scoped to every operation', () => {
    const counters = buildCounters({
      limits: [buildLimit({ operationType: UsageOperationType.ALL })],
      quotaLimitDefaults: [buildDefault()],
    });

    expect(counters.map((counter) => counter.isDefault)).toEqual([true, false]);
  });

  it('ignores a default declared on another operation', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [
        buildDefault({ operationType: UsageOperationType.WEB_SEARCH }),
      ],
    });

    expect(counters).toEqual([]);
  });

  it('overrides the default whatever period the stored limit spans', () => {
    const counters = buildCounters({
      limits: [buildLimit({ periodUnit: 'week' })],
      quotaLimitDefaults: [buildDefault()],
    });

    expect(counters).toEqual([
      expect.objectContaining({ isDefault: false, periodUnit: 'week' }),
    ]);
  });
});
