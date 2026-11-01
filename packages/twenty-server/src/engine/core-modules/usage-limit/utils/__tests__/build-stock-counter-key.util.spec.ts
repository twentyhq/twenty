import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

describe('buildStockCounterKey', () => {
  it('keys the held stock by its scope alone, under the workspace hash tag', () => {
    expect(
      buildStockCounterKey({
        workspaceId: 'workspace-1',
        counter: {
          resourceType: UsageResourceType.STORAGE,
          operationType: UsageOperationType.STORAGE_FILE,
          spenderType: 'workspace',
          spenderId: null,
          unit: UsageUnit.BYTE,
        },
      }),
    ).toBe('{workspace-1}:stock-held:STORAGE:STORAGE_FILE:workspace:-:BYTE');
  });
});
