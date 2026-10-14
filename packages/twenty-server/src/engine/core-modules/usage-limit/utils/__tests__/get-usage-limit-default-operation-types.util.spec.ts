import { findUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-defaults.util';
import { getUsageLimitDefaultOperationTypes } from 'src/engine/core-modules/usage-limit/utils/get-usage-limit-default-operation-types.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const findFirstDefault = (resourceType: UsageResourceType) => {
  const [usageLimitDefault] = findUsageLimitDefaults({ resourceType });

  return usageLimitDefault;
};

describe('getUsageLimitDefaultOperationTypes', () => {
  it('wraps the single operation of a speed default', () => {
    expect(
      getUsageLimitDefaultOperationTypes(
        findFirstDefault(UsageResourceType.API),
      ),
    ).toEqual([UsageOperationType.API_REQUEST]);
  });

  it('wraps the single operation of a stock default', () => {
    expect(
      getUsageLimitDefaultOperationTypes(
        findFirstDefault(UsageResourceType.STORAGE),
      ),
    ).toEqual([UsageOperationType.STORAGE_FILE]);
  });

  it('returns the operations a quota default lists', () => {
    expect(
      getUsageLimitDefaultOperationTypes(
        findFirstDefault(UsageResourceType.AI),
      ),
    ).toEqual([
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.WEB_SEARCH,
    ]);
  });
});
