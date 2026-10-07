import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { buildUsageScopeFilter } from 'src/engine/core-modules/usage/utils/build-usage-scope-filter.util';

const BILLABLE_OPERATION_TYPE_CLAUSE =
  'AND operationType NOT IN ({nonBillableOperationTypes:Array(String)})';

const BILLABLE_OPERATION_TYPE_PARAMS = {
  nonBillableOperationTypes: [UsageOperationType.AI_CHAT_INCLUDED],
};

describe('buildUsageScopeFilter', () => {
  it('narrows a workspace scope over every operation to billable operations', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.ALL,
      unit: null,
      spenderType: 'workspace',
      spenderId: null,
    });

    expect(filter).toEqual({
      clause: BILLABLE_OPERATION_TYPE_CLAUSE,
      params: BILLABLE_OPERATION_TYPE_PARAMS,
    });
  });

  it('reads a named non-billable operation without the billable narrowing', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
      unit: null,
      spenderType: 'workspace',
      spenderId: null,
    });

    expect(filter.clause).not.toContain('NOT IN');
    expect(filter.params).toEqual({
      operationType: UsageOperationType.AI_CHAT_INCLUDED,
    });
  });

  it('pins the operation when the scope names one', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      unit: null,
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

  it('pins the unit when the scope names one', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.CODE_EXECUTION,
      unit: UsageUnit.MILLISECOND,
      spenderType: 'workspace',
      spenderId: null,
    });

    expect(filter.clause).toContain('AND unit = {unit:String}');
    expect(filter.params).toEqual({
      operationType: UsageOperationType.CODE_EXECUTION,
      unit: UsageUnit.MILLISECOND,
    });
  });

  it('pins the spender id on the column of its type', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.ALL,
      unit: null,
      spenderType: 'apiKey',
      spenderId: 'api-key-1',
    });

    expect(filter.clause).toContain('AND apiKeyId = {spenderId:String}');
    expect(filter.params).toEqual({
      ...BILLABLE_OPERATION_TYPE_PARAMS,
      spenderId: 'api-key-1',
    });
  });

  it('sums every spender of the type when the scope carries no id', () => {
    const filter = buildUsageScopeFilter({
      operationType: UsageOperationType.ALL,
      unit: null,
      spenderType: 'userWorkspace',
      spenderId: null,
    });

    expect(filter.clause).toContain("AND userWorkspaceId != ''");
    expect(filter.params).toEqual(BILLABLE_OPERATION_TYPE_PARAMS);
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
      unit: null,
      spenderType,
      spenderId: 'spender-1',
    });

    expect(filter.clause).toBe(
      `${BILLABLE_OPERATION_TYPE_CLAUSE}\nAND ${column} = {spenderId:String}`,
    );
  });
});
