import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildStaleUpdatedLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-stale-updated-limit-counter-keys.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const MONTH_PERIOD = {
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
};

const USER_1_KEY = `{workspace-1}:quota-consumed:limit-1:AI:AI_CHAT_TOKEN:userWorkspace:user-1:CREDIT:month:${MONTH_PERIOD.periodStart.getTime()}`;

const USER_2_KEY = `{workspace-1}:quota-consumed:limit-1:AI:AI_CHAT_TOKEN:userWorkspace:user-2:CREDIT:month:${MONTH_PERIOD.periodStart.getTime()}`;

const buildLimit = (
  overrides: Partial<FlatUsageLimit> = {},
): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'userWorkspace',
  spenderId: 'user-1',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  unit: UsageUnit.CREDIT,
  limitValue: 1_000,
  burstValue: null,
  isInstanceOverride: false,
  ...overrides,
});

const buildKeys = ({
  previousUsageLimit = buildLimit(),
  updatedUsageLimit = buildLimit(),
  isPreviousUsageLimitEnforced = true,
}: {
  previousUsageLimit?: FlatUsageLimit;
  updatedUsageLimit?: FlatUsageLimit;
  isPreviousUsageLimitEnforced?: boolean;
}) =>
  buildStaleUpdatedLimitCounterKeys({
    workspaceId: 'workspace-1',
    previousUsageLimit,
    updatedUsageLimit,
    isPreviousUsageLimitEnforced,
    periodByUnit: { month: MONTH_PERIOD },
  });

describe('buildStaleUpdatedLimitCounterKeys', () => {
  it('keeps the counter of an enforced limit whose cap is edited', () => {
    expect(
      buildKeys({ updatedUsageLimit: buildLimit({ limitValue: 500 }) }),
    ).toEqual([]);
  });

  it('drops the counter of a limit that was not enforced before the edit', () => {
    expect(
      buildKeys({
        updatedUsageLimit: buildLimit({ isInstanceOverride: true }),
        isPreviousUsageLimitEnforced: false,
      }),
    ).toEqual([USER_1_KEY]);
  });

  it('drops the counter the edit moves the limit onto', () => {
    expect(
      buildKeys({ updatedUsageLimit: buildLimit({ spenderId: 'user-2' }) }),
    ).toEqual([USER_2_KEY]);
  });

  it('leaves stock limits alone', () => {
    expect(
      buildKeys({
        updatedUsageLimit: buildLimit({
          limitKind: 'stock',
          periodUnit: 'lifetime',
        }),
        isPreviousUsageLimitEnforced: false,
      }),
    ).toEqual([]);
  });

  it('skips a limit whose period was not resolved', () => {
    expect(
      buildKeys({
        updatedUsageLimit: buildLimit({ periodUnit: 'week' }),
        isPreviousUsageLimitEnforced: false,
      }),
    ).toEqual([]);
  });
});
