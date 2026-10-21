import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

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
  unit: UsageUnit.CREDIT,
  limitValue: 1_000_000,
  burstValue: null,
  isInstanceOverride: false,
  ...overrides,
});

const buildDefault = (
  overrides: Partial<QuotaLimitDefault> = {},
): QuotaLimitDefault => ({
  resourceType: UsageResourceType.AI,
  operationTypes: [UsageOperationType.AI_CHAT_TOKEN],
  limitKind: 'quota',
  spenderType: 'workspace',
  spenderId: '',
  isPerSpender: false,
  unit: UsageUnit.CREDIT,
  periodUnit: 'month',
  periodCount: 1,
  isOverridable: true,
  limitValue: 5_000,
  ...overrides,
});

const buildCounters = ({
  limits = [],
  quotaLimitDefaults = [],
  operationType = UsageOperationType.AI_CHAT_TOKEN,
}: {
  limits?: FlatQuotaLimit[];
  quotaLimitDefaults?: QuotaLimitDefault[];
  operationType?: UsageOperationType;
}) =>
  buildQuotaCounters({
    limits,
    quotaLimitDefaults,
    usageSpenders: { userWorkspaceId: 'user-1' },
    workspaceId: 'workspace-1',
    operationType,
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
        key: `{workspace-1}:quota-consumed:AI:AI_CHAT_TOKEN:workspace:-:CREDIT:month:${MONTH_PERIOD.periodStart.getTime()}`,
        limitValue: 1_000_000,
        unit: UsageUnit.CREDIT,
        resourceType: UsageResourceType.AI,
        periodUnit: 'month',
        periodStart: MONTH_PERIOD.periodStart,
        periodEnd: MONTH_PERIOD.periodEnd,
        spenderType: 'workspace',
        spenderId: null,
        operationTypes: [UsageOperationType.AI_CHAT_TOKEN],
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

    expect(counters.map((counter) => counter.operationTypes)).toEqual([
      [UsageOperationType.AI_CHAT_TOKEN],
      [UsageOperationType.ALL],
    ]);
  });

  it('ranks an every-resource limit after the resource and every-operation ones', () => {
    const applicationLimit = {
      spenderType: 'application',
      spenderId: 'app-1',
    } as const;

    const counters = buildQuotaCounters({
      limits: [
        buildLimit({
          ...applicationLimit,
          id: 'every-resource',
          resourceType: UsageResourceType.ALL,
          operationType: UsageOperationType.ALL,
        }),
        buildLimit({
          ...applicationLimit,
          id: 'every-operation',
          operationType: UsageOperationType.ALL,
        }),
        buildLimit({ ...applicationLimit, id: 'chat' }),
      ],
      quotaLimitDefaults: [],
      usageSpenders: { applicationId: 'app-1' },
      workspaceId: 'workspace-1',
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      periodByUnit: { month: MONTH_PERIOD },
    });

    expect(
      counters.map(({ resourceType, operationTypes }) => [
        resourceType,
        operationTypes,
      ]),
    ).toEqual([
      [UsageResourceType.AI, [UsageOperationType.AI_CHAT_TOKEN]],
      [UsageResourceType.AI, [UsageOperationType.ALL]],
      [UsageResourceType.ALL, [UsageOperationType.ALL]],
    ]);
    expect(counters[2].key).toContain(
      ':quota-consumed:ALL:ALL:application:app-1:',
    );
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
        key: `{workspace-1}:quota-consumed:AI:AI_CHAT_TOKEN:workspace:-:CREDIT:month:${MONTH_PERIOD.periodStart.getTime()}`,
        limitValue: 5_000,
        unit: UsageUnit.CREDIT,
        resourceType: UsageResourceType.AI,
        periodUnit: 'month',
        periodStart: MONTH_PERIOD.periodStart,
        periodEnd: MONTH_PERIOD.periodEnd,
        spenderType: 'workspace',
        spenderId: null,
        operationTypes: [UsageOperationType.AI_CHAT_TOKEN],
      },
    ]);
  });

  it.each([500, 50_000])(
    'overrides the default with a workspace limit of %i on the same counter',
    (limitValue) => {
      const [defaultCounter] = buildCounters({
        quotaLimitDefaults: [buildDefault()],
      });

      const counters = buildCounters({
        limits: [buildLimit({ limitValue })],
        quotaLimitDefaults: [buildDefault()],
      });

      expect(counters).toEqual([
        expect.objectContaining({
          isDefault: false,
          limitValue,
          key: defaultCounter.key,
        }),
      ]);
    },
  );

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

  it('ignores a default declared on another operation', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [
        buildDefault({ operationTypes: [UsageOperationType.WEB_SEARCH] }),
      ],
    });

    expect(counters).toEqual([]);
  });

  it('keeps the default alongside a stored limit on another period', () => {
    const counters = buildCounters({
      limits: [buildLimit({ periodUnit: 'week' })],
      quotaLimitDefaults: [buildDefault()],
    });

    expect(counters).toEqual([
      expect.objectContaining({ isDefault: false, periodUnit: 'week' }),
      expect.objectContaining({ isDefault: true, periodUnit: 'month' }),
    ]);
    expect(new Set(counters.map((counter) => counter.key)).size).toBe(2);
  });

  it('gives each spender its own counter for a per-spender default', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [
        buildDefault({ spenderType: 'userWorkspace', isPerSpender: true }),
      ],
    });

    expect(counters).toEqual([
      expect.objectContaining({
        isDefault: true,
        spenderType: 'userWorkspace',
        spenderId: 'user-1',
        key: `{workspace-1}:quota-consumed:AI:AI_CHAT_TOKEN:userWorkspace:user-1:CREDIT:month:${MONTH_PERIOD.periodStart.getTime()}`,
      }),
    ]);
  });

  it('builds a user allowance counter from a user credit default', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [
        buildDefault({
          spenderType: 'userWorkspace',
          isPerSpender: true,
          unit: UsageUnit.USER_CREDIT,
        }),
      ],
    });

    expect(counters).toEqual([
      expect.objectContaining({
        kind: 'userAllowance',
        spenderId: 'user-1',
        unit: UsageUnit.USER_CREDIT,
      }),
    ]);
  });

  it('builds no user allowance counter when user credits are 0', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [
        buildDefault({
          spenderType: 'userWorkspace',
          isPerSpender: true,
          unit: UsageUnit.USER_CREDIT,
          limitValue: 0,
        }),
        buildDefault({ limitValue: 0 }),
      ],
    });

    expect(counters).toEqual([
      expect.objectContaining({ kind: 'limit', limitValue: 0 }),
    ]);
  });

  it('shares one counter across spenders for a default that is not per spender', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [buildDefault({ spenderType: 'userWorkspace' })],
    });

    expect(counters).toEqual([
      expect.objectContaining({
        spenderType: 'userWorkspace',
        spenderId: null,
        key: `{workspace-1}:quota-consumed:AI:AI_CHAT_TOKEN:userWorkspace:-:CREDIT:month:${MONTH_PERIOD.periodStart.getTime()}`,
      }),
    ]);
  });

  it('shares one counter across the operations a default lists', () => {
    const quotaLimitDefaults = [
      buildDefault({
        operationTypes: [
          UsageOperationType.AI_CHAT_TOKEN,
          UsageOperationType.WEB_SEARCH,
        ],
        isOverridable: false,
      }),
    ];

    const [chatCounter] = buildCounters({ quotaLimitDefaults });
    const [webSearchCounter] = buildCounters({
      quotaLimitDefaults,
      operationType: UsageOperationType.WEB_SEARCH,
    });

    expect(chatCounter.key).toBe(webSearchCounter.key);
  });

  it('ignores a default listing other operations', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [
        buildDefault({
          operationTypes: [
            UsageOperationType.WEB_SEARCH,
            UsageOperationType.AI_WORKFLOW_TOKEN,
          ],
          isOverridable: false,
        }),
      ],
    });

    expect(counters).toEqual([]);
  });

  it('ranks a single operation before a list, and a list before every operation', () => {
    const counters = buildCounters({
      quotaLimitDefaults: [
        buildDefault({ operationTypes: [UsageOperationType.ALL] }),
        buildDefault({
          operationTypes: [
            UsageOperationType.AI_CHAT_TOKEN,
            UsageOperationType.WEB_SEARCH,
          ],
          isOverridable: false,
        }),
        buildDefault(),
      ],
    });

    expect(counters.map((counter) => counter.operationTypes)).toEqual([
      [UsageOperationType.AI_CHAT_TOKEN],
      [UsageOperationType.AI_CHAT_TOKEN, UsageOperationType.WEB_SEARCH],
      [UsageOperationType.ALL],
    ]);
  });
});
