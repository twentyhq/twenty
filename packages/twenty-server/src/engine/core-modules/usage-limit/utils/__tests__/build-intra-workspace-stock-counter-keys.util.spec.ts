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
  it('keys an application stock the entitlement turns enforced', () => {
    expect(
      buildIntraWorkspaceStockCounterKeys({
        workspaceId: 'workspace-1',
        limits: [buildLimit({})],
      }),
    ).toEqual([
      '{workspace-1}:stock-held:STORAGE:STORAGE_FILE:application:application-1:BYTE',
    ]);
  });
});
