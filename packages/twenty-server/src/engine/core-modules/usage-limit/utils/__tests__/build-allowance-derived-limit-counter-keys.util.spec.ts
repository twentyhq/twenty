import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildAllowanceDerivedLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-allowance-derived-limit-counter-keys.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const PERIOD_START = new Date('2026-08-15T09:00:00.000Z');

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'allowancePeriod',
  meter: 'creditsUsedMicro',
  limitValueType: 'allowancePercent',
  limitValue: 40,
  burstValue: null,
  ...overrides,
});

describe('buildAllowanceDerivedLimitCounterKeys', () => {
  it('keys every percent quota on the allowance period start', () => {
    expect(
      buildAllowanceDerivedLimitCounterKeys({
        workspaceId: 'workspace-1',
        limits: [
          buildLimit({}),
          buildLimit({
            id: 'limit-2',
            spenderType: 'userWorkspace',
            spenderId: 'user-1',
          }),
        ],
        periodStart: PERIOD_START,
      }),
    ).toEqual([
      `{workspace-1}:quota:AI:ALL:workspace:-:creditsUsedMicro:allowancePeriod:${PERIOD_START.getTime()}`,
      `{workspace-1}:quota:AI:ALL:userWorkspace:user-1:creditsUsedMicro:allowancePeriod:${PERIOD_START.getTime()}`,
    ]);
  });

  it('leaves absolute quotas and speed limits alone', () => {
    expect(
      buildAllowanceDerivedLimitCounterKeys({
        workspaceId: 'workspace-1',
        limits: [
          buildLimit({
            limitValueType: 'absolute',
            limitValue: 1_000,
            periodUnit: 'month',
          }),
          buildLimit({
            limitKind: 'speed',
            limitValueType: 'absolute',
            periodUnit: 'second',
            meter: 'quantity',
          }),
        ],
        periodStart: PERIOD_START,
      }),
    ).toEqual([]);
  });
});
