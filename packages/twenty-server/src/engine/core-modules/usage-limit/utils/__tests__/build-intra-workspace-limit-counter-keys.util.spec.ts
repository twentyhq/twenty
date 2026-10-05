import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildIntraWorkspaceLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-limit-counter-keys.util';
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

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  spenderType: 'userWorkspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  unit: UsageUnit.CREDIT,
  limitValue: 1_000,
  burstValue: null,
  isInstanceOverride: false,
  ...overrides,
});

describe('buildIntraWorkspaceLimitCounterKeys', () => {
  it('keys every intra-workspace quota on its period unit', () => {
    expect(
      buildIntraWorkspaceLimitCounterKeys({
        workspaceId: 'workspace-1',
        limits: [
          buildLimit({}),
          buildLimit({
            id: 'limit-2',
            spenderType: 'agent',
            spenderId: 'agent-1',
            periodUnit: 'week',
          }),
        ],
        periodByUnit: { month: MONTH_PERIOD, week: WEEK_PERIOD },
      }),
    ).toEqual([
      `{workspace-1}:quota:AI:ALL:userWorkspace:-:CREDIT:month:${MONTH_PERIOD.periodStart.getTime()}:1000`,
      `{workspace-1}:quota:AI:ALL:agent:agent-1:CREDIT:week:${WEEK_PERIOD.periodStart.getTime()}:1000`,
    ]);
  });

  it('leaves workspace-scoped quotas and speed limits alone', () => {
    expect(
      buildIntraWorkspaceLimitCounterKeys({
        workspaceId: 'workspace-1',
        limits: [
          buildLimit({ spenderType: 'workspace' }),
          buildLimit({
            limitKind: 'speed',
            periodUnit: 'second',
            unit: UsageUnit.TOKEN,
          }),
        ],
        periodByUnit: { month: MONTH_PERIOD },
      }),
    ).toEqual([]);
  });

  it('skips a quota whose period is unknown', () => {
    expect(
      buildIntraWorkspaceLimitCounterKeys({
        workspaceId: 'workspace-1',
        limits: [buildLimit({ periodUnit: 'week' })],
        periodByUnit: { month: MONTH_PERIOD },
      }),
    ).toEqual([]);
  });
});
