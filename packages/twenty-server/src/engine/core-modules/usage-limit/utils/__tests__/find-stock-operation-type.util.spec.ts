import { findStockOperationType } from 'src/engine/core-modules/usage-limit/utils/find-stock-operation-type.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

describe('findStockOperationType', () => {
  it('names the one operation a stock resource counts', () => {
    expect(findStockOperationType(UsageResourceType.STORAGE)).toBe(
      UsageOperationType.STORAGE_FILE,
    );
  });
});
