import { doesOperationTypeMatchScope } from 'src/engine/core-modules/usage-limit/utils/does-operation-type-match-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

describe('doesOperationTypeMatchScope', () => {
  it('matches the operation a scope names', () => {
    expect(
      doesOperationTypeMatchScope({
        scopeOperationType: UsageOperationType.AI_CHAT_TOKEN,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
      }),
    ).toBe(true);
  });

  it('leaves another operation out of a named scope', () => {
    expect(
      doesOperationTypeMatchScope({
        scopeOperationType: UsageOperationType.AI_CHAT_TOKEN,
        operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      }),
    ).toBe(false);
  });

  it('matches a billable operation on a scope over every operation', () => {
    expect(
      doesOperationTypeMatchScope({
        scopeOperationType: UsageOperationType.ALL,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
      }),
    ).toBe(true);
  });

  it('leaves included chat out of a scope over every operation', () => {
    expect(
      doesOperationTypeMatchScope({
        scopeOperationType: UsageOperationType.ALL,
        operationType: UsageOperationType.AI_CHAT_INCLUDED,
      }),
    ).toBe(false);
  });

  it('matches included chat on a scope that names it', () => {
    expect(
      doesOperationTypeMatchScope({
        scopeOperationType: UsageOperationType.AI_CHAT_INCLUDED,
        operationType: UsageOperationType.AI_CHAT_INCLUDED,
      }),
    ).toBe(true);
  });
});
