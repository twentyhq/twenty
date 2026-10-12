import { findStockOperationType } from 'src/engine/core-modules/usage-limit/utils/find-stock-operation-type.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

describe('findStockOperationType', () => {
  it.each([
    [UsageResourceType.STORAGE, UsageOperationType.STORAGE_FILE],
    [UsageResourceType.RECORD, UsageOperationType.RECORD_WRITE],
  ] as const)(
    'names the one operation a %s stock counts',
    (resourceType, operationType) => {
      expect(findStockOperationType(resourceType)).toBe(operationType);
    },
  );
});
