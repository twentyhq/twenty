import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildIntraWorkspaceLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-limit-counter-keys.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const MONTH_PERIOD = {
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
};

const ALLOWANCE_PERIOD = {
  periodStart: new Date('2026-08-15T09:00:00.000Z'),
  periodEnd: new Date('2026-09-15T09:00:00.000Z'),
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
  meter: 'creditsUsedMicro',
  limitValueType: 'absolute',
  limitValue: 1_000,
  burstValue: null,
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
            periodUnit: 'allowancePeriod',
            limitValueType: 'allowancePercent',
            limitValue: 40,
          }),
        ],
        periodByUnit: {
          month: MONTH_PERIOD,
          allowancePeriod: ALLOWANCE_PERIOD,
        },
      }),
    ).toEqual([
      `{workspace-1}:quota:AI:ALL:userWorkspace:-:creditsUsedMicro:month:${MONTH_PERIOD.periodStart.getTime()}`,
      `{workspace-1}:quota:AI:ALL:agent:agent-1:creditsUsedMicro:allowancePeriod:${ALLOWANCE_PERIOD.periodStart.getTime()}`,
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
            meter: 'quantity',
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
        limits: [buildLimit({ periodUnit: 'allowancePeriod' })],
        periodByUnit: { month: MONTH_PERIOD },
      }),
    ).toEqual([]);
  });
});
