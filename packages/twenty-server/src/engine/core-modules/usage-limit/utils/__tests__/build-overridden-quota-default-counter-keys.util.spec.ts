import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type UsageLimitCounterScope } from 'src/engine/core-modules/usage-limit/types/usage-limit-counter-scope.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildOverriddenQuotaDefaultCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-overridden-quota-default-counter-keys.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const DAY_PERIOD = {
  periodStart: new Date('2026-08-20T00:00:00.000Z'),
  periodEnd: new Date('2026-08-21T00:00:00.000Z'),
};

const DEFAULT_COUNTER_KEY = `{workspace-1}:quota-consumed:default:EMAIL:EMAIL_SEND:workspace:-:INVOCATION:day:${DAY_PERIOD.periodStart.getTime()}`;

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
  unit: UsageUnit.INVOCATION,
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
  unit: UsageUnit.INVOCATION,
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
  buildOverriddenQuotaDefaultCounterKeys({
    usageLimit,
    quotaLimitDefaults,
    periodByUnit,
  });

describe('buildOverriddenQuotaDefaultCounterKeys', () => {
  it('keys the default counter the row overrides', () => {
    expect(buildKeys()).toEqual([DEFAULT_COUNTER_KEY]);
  });

  it('leaves alone a default the row does not override', () => {
    expect(
      buildKeys({ usageLimit: buildUsageLimit({ periodUnit: 'month' }) }),
    ).toEqual([]);
  });

  it('leaves alone a default that cannot be overridden', () => {
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
