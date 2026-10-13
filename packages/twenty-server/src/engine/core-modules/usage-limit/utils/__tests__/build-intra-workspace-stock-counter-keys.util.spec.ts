import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildIntraWorkspaceStockCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-stock-counter-keys.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'application',
  spenderId: 'application-1',
  limitKind: 'stock',
  periodCount: 1,
  periodUnit: 'lifetime',
  unit: UsageUnit.BYTE,
  limitValue: 1_000,
  burstValue: null,
  isInstanceOverride: false,
  ...overrides,
});

describe('buildIntraWorkspaceStockCounterKeys', () => {
  it('keys every intra-workspace stock limit the entitlement turns enforced', () => {
    expect(
      buildIntraWorkspaceStockCounterKeys({
        workspaceId: 'workspace-1',
        limits: [
          buildLimit({}),
          buildLimit({
            id: 'limit-2',
            spenderId: 'application-2',
            unit: UsageUnit.FILE,
          }),
        ],
      }),
    ).toEqual([
      '{workspace-1}:stock-held:STORAGE:STORAGE_FILE:application:application-1:BYTE',
      '{workspace-1}:stock-held:STORAGE:STORAGE_FILE:application:application-2:FILE',
    ]);
  });

  it('leaves workspace-scoped stock limits, operator overrides and quotas alone', () => {
    expect(
      buildIntraWorkspaceStockCounterKeys({
        workspaceId: 'workspace-1',
        limits: [
          buildLimit({ spenderType: 'workspace', spenderId: '' }),
          buildLimit({ id: 'limit-2', isInstanceOverride: true }),
          buildLimit({
            id: 'limit-3',
            resourceType: UsageResourceType.AI,
            operationType: UsageOperationType.ALL,
            limitKind: 'quota',
            periodUnit: 'month',
            unit: UsageUnit.CREDIT,
          }),
        ],
      }),
    ).toEqual([]);
  });
});
