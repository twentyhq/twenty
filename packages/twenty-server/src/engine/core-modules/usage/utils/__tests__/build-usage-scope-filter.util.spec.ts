import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { buildUsageScopeFilter } from 'src/engine/core-modules/usage/utils/build-usage-scope-filter.util';

describe('buildUsageScopeFilter', () => {
  it('narrows nothing for a workspace scope over every operation', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.ALL,
      spenderType: 'workspace',
      spenderId: null,
    });

    expect(filter).toEqual({ clause: '', params: {} });
  });

  it('pins the operation when the scope names one', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenderType: 'workspace',
      spenderId: null,
    });

    expect(filter.clause).toContain(
      'AND operationType = {operationType:String}',
    );
    expect(filter.params).toEqual({
      operationType: UsageOperationType.AI_CHAT_TOKEN,
    });
  });

  it('pins the spender id on the column of its type', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.ALL,
      spenderType: 'apiKey',
      spenderId: 'api-key-1',
    });

    expect(filter.clause).toContain('AND apiKeyId = {spenderId:String}');
    expect(filter.params).toEqual({ spenderId: 'api-key-1' });
  });

  it('sums every spender of the type when the scope carries no id', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.ALL,
      spenderType: 'userWorkspace',
      spenderId: null,
    });

    expect(filter.clause).toContain("AND userWorkspaceId != ''");
    expect(filter.params).toEqual({});
  });

  it.each([
    ['userWorkspace', 'userWorkspaceId'],
    ['apiKey', 'apiKeyId'],
    ['application', 'applicationId'],
    ['agent', 'agentId'],
    ['workflow', 'workflowId'],
    ['logicFunction', 'logicFunctionId'],
  ] as const)('scopes a %s on %s', (spenderType, column) => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.ALL,
      spenderType,
      spenderId: 'spender-1',
    });

    expect(filter.clause).toBe(`AND ${column} = {spenderId:String}`);
  });
});
