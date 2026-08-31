import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildQuotaBounds } from 'src/engine/core-modules/usage-limit/utils/build-quota-bounds.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const BILLING_PERIOD = {
  periodStart: new Date('2026-08-15T09:00:00.000Z'),
  periodEnd: new Date('2026-09-15T09:00:00.000Z'),
};

const WEEK_PERIOD = {
  periodStart: new Date('2026-08-24T00:00:00.000Z'),
  periodEnd: new Date('2026-08-31T00:00:00.000Z'),
};

const buildRule = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'billingPeriod',
  meter: 'creditsUsedMicro',
  limitValueType: 'absolute',
  limitValue: 1_000_000,
  burstValue: null,
  ...overrides,
});

const buildBounds = ({
  rules,
  allowanceMicro = null,
}: {
  rules: FlatUsageLimit[];
  allowanceMicro?: number | null;
}) =>
  buildQuotaBounds({
    rules,
    usageSpenders: { userWorkspaceId: 'user-1' },
    workspaceId: 'workspace-1',
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    periodByUnit: { billingPeriod: BILLING_PERIOD, week: WEEK_PERIOD },
    allowanceMicro,
  });

describe('buildQuotaBounds', () => {
  it('builds one bound per matching rule with a period-scoped key', () => {
    const bounds = buildBounds({
      rules: [buildRule({ spenderType: 'workspace' })],
    });

    expect(bounds).toEqual([
      {
        key: `{workspace-1}:quota:AI:AI_CHAT_TOKEN:workspace:-:billingPeriod:${BILLING_PERIOD.periodStart.getTime()}`,
        limitValue: 1_000_000,
        meter: 'creditsUsedMicro',
        periodUnit: 'billingPeriod',
        periodStart: BILLING_PERIOD.periodStart,
        periodEnd: BILLING_PERIOD.periodEnd,
        spenderType: 'workspace',
        spenderId: null,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
      },
    ]);
  });

  it('anchors each bound to its own period unit', () => {
    const bounds = buildBounds({
      rules: [
        buildRule({ id: 'monthly' }),
        buildRule({ id: 'weekly', periodUnit: 'week' }),
      ],
    });

    expect(bounds.map((bound) => bound.periodStart)).toEqual([
      BILLING_PERIOD.periodStart,
      WEEK_PERIOD.periodStart,
    ]);
  });

  it('ignores rules for spenders absent from the call', () => {
    const bounds = buildBounds({
      rules: [buildRule({ spenderType: 'apiKey', spenderId: 'key-1' })],
    });

    expect(bounds).toEqual([]);
  });

  it('applies a wildcard-operation rule alongside the operation-scoped one', () => {
    const bounds = buildBounds({
      rules: [
        buildRule({ id: 'all', operationType: UsageOperationType.ALL }),
        buildRule({ id: 'chat' }),
      ],
    });

    expect(bounds.map((bound) => bound.operationType)).toEqual([
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.ALL,
    ]);
  });

  it('ranks a named user bound before workspace bounds', () => {
    const bounds = buildBounds({
      rules: [
        buildRule({ spenderType: 'workspace' }),
        buildRule({
          id: 'limit-2',
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
        }),
      ],
    });

    expect(bounds.map((bound) => bound.spenderType)).toEqual([
      'userWorkspace',
      'workspace',
    ]);
  });

  it('resolves a percent rule against the allowance', () => {
    const bounds = buildBounds({
      rules: [buildRule({ limitValueType: 'percent', limitValue: 5_000 })],
      allowanceMicro: 2_000_000,
    });

    expect(bounds[0].limitValue).toBe(1_000_000);
  });

  it('skips a percent rule when no allowance exists', () => {
    const bounds = buildBounds({
      rules: [buildRule({ limitValueType: 'percent', limitValue: 5_000 })],
      allowanceMicro: null,
    });

    expect(bounds).toEqual([]);
  });

  it('skips a rule whose period was not resolved', () => {
    const bounds = buildBounds({
      rules: [buildRule({ periodUnit: 'day' })],
    });

    expect(bounds).toEqual([]);
  });

  it('does not match a rule for another operation', () => {
    const bounds = buildBounds({
      rules: [
        buildRule({ operationType: UsageOperationType.AI_WORKFLOW_TOKEN }),
      ],
    });

    expect(bounds).toEqual([]);
  });
});
