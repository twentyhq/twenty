import { isOperationInScope } from 'src/engine/core-modules/usage-limit/utils/is-operation-in-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

describe('isOperationInScope', () => {
  it('covers every operation for ALL', () => {
    expect(
      isOperationInScope({
        operationScope: UsageOperationType.ALL,
        operationType: UsageOperationType.WEB_SEARCH,
      }),
    ).toBe(true);
  });

  it('covers only the named operation', () => {
    expect(
      isOperationInScope({
        operationScope: UsageOperationType.AI_CHAT_TOKEN,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
      }),
    ).toBe(true);
    expect(
      isOperationInScope({
        operationScope: UsageOperationType.AI_CHAT_TOKEN,
        operationType: UsageOperationType.WEB_SEARCH,
      }),
    ).toBe(false);
  });

  it('covers the listed operations only', () => {
    const operationScope = [
      UsageOperationType.AI_CHAT_TOKEN,
      UsageOperationType.WEB_SEARCH,
    ];

    expect(
      isOperationInScope({
        operationScope,
        operationType: UsageOperationType.WEB_SEARCH,
      }),
    ).toBe(true);
    expect(
      isOperationInScope({
        operationScope,
        operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      }),
    ).toBe(false);
  });
});
