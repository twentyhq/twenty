import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { buildStockExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-stock-exhausted-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const COUNTER: StockCounter = {
  key: '{workspace-1}:stock-held:STORAGE:STORAGE_FILE:workspace:-:FILE',
  isDefault: false,
  limitValue: 10,
  unit: UsageUnit.FILE,
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'workspace',
  spenderId: null,
};

describe('buildStockExhaustedScope', () => {
  it('reports what the held stock leaves under the cap', () => {
    expect(buildStockExhaustedScope({ counter: COUNTER, held: 7 })).toEqual(
      expect.objectContaining({ limitValue: 10, remaining: 3 }),
    );
  });
});
