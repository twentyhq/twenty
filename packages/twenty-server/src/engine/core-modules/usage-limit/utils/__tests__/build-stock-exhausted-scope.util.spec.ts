import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { buildStockExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-stock-exhausted-scope.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const COUNTER: StockCounter = {
  key: '{workspace-1}:stock-held:STORAGE:workspace:-:FILE',
  isDefault: false,
  limitValue: 10,
  unit: UsageUnit.FILE,
  resourceType: UsageResourceType.STORAGE,
  spenderType: 'workspace',
  spenderId: null,
};

describe('buildStockExhaustedScope', () => {
  it.each([
    [7, 3],
    [12, -2],
  ])('reports what %i held leaves under a cap of 10', (held, remaining) => {
    expect(buildStockExhaustedScope({ counter: COUNTER, held })).toEqual(
      expect.objectContaining({ limitValue: 10, remaining }),
    );
  });
});
