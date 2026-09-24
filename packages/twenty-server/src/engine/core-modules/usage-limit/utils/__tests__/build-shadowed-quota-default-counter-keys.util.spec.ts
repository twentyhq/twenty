import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type UsageLimitCounterScope } from 'src/engine/core-modules/usage-limit/types/usage-limit-counter-scope.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildShadowedQuotaDefaultCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-shadowed-quota-default-counter-keys.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const DAY_PERIOD = {
  periodStart: new Date('2026-08-20T00:00:00.000Z'),
  periodEnd: new Date('2026-08-21T00:00:00.000Z'),
};

const DEFAULT_COUNTER_KEY = `{workspace-1}:quota:EMAIL:EMAIL_SEND:workspace:-:quantity:day:${DAY_PERIOD.periodStart.getTime()}:default:1000`;

const buildUsageLimit = (
  overrides: Partial<UsageLimitCounterScope> = {},
): UsageLimitCounterScope => ({
  workspaceId: 'workspace-1',
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodUnit: 'day',
  meter: 'quantity',
  ...overrides,
});

const buildDefault = (
  overrides: Partial<QuotaLimitDefault> = {},
): QuotaLimitDefault => ({
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  limitKind: 'quota',
  spenderType: 'workspace',
  spenderId: '',
  meter: 'quantity',
  periodUnit: 'day',
  periodCount: 1,
  isOverridable: true,
  limitValue: 1_000,
  ...overrides,
});

const buildKeys = ({
  usageLimit = buildUsageLimit(),
  quotaLimitDefaults = [buildDefault()],
  periodByUnit = { day: DAY_PERIOD },
}: {
  usageLimit?: UsageLimitCounterScope;
  quotaLimitDefaults?: QuotaLimitDefault[];
  periodByUnit?: Partial<Record<PeriodUnit, UsagePeriod>>;
} = {}) =>
  buildShadowedQuotaDefaultCounterKeys({
    usageLimit,
    quotaLimitDefaults,
    periodByUnit,
  });

describe('buildShadowedQuotaDefaultCounterKeys', () => {
  it('keys the default counter the row suppresses', () => {
    expect(buildKeys()).toEqual([DEFAULT_COUNTER_KEY]);
  });

  it('keys it whatever period the row itself spans', () => {
    expect(
      buildKeys({ usageLimit: buildUsageLimit({ periodUnit: 'month' }) }),
    ).toEqual([DEFAULT_COUNTER_KEY]);
  });

  it.each([
    { spenderType: 'userWorkspace' as const },
    { meter: 'creditsUsedMicro' as const },
    { operationType: UsageOperationType.ALL },
  ])('leaves a default on another scope alone: %j', (overrides) => {
    expect(buildKeys({ usageLimit: buildUsageLimit(overrides) })).toEqual([]);
  });

  it('leaves a default no row can suppress alone', () => {
    expect(
      buildKeys({
        quotaLimitDefaults: [buildDefault({ isOverridable: false })],
      }),
    ).toEqual([]);
  });

  it('skips a default whose period was not resolved', () => {
    expect(buildKeys({ periodByUnit: {} })).toEqual([]);
  });
});
