import { getUsageLimitDefaultOperationTypes } from 'src/engine/core-modules/usage-limit/utils/get-usage-limit-default-operation-types.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

describe('getUsageLimitDefaultOperationTypes', () => {
  it('wraps the single operation of a speed or stock default', () => {
    expect(
      getUsageLimitDefaultOperationTypes({
        operationType: UsageOperationType.API_REQUEST,
      }),
    ).toEqual([UsageOperationType.API_REQUEST]);
  });

  it('returns the operations a quota default lists', () => {
    expect(
      getUsageLimitDefaultOperationTypes({
        operationTypes: [
          UsageOperationType.AI_CHAT_TOKEN,
          UsageOperationType.WEB_SEARCH,
        ],
      }),
    ).toEqual([
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.WEB_SEARCH,
    ]);
  });
});
