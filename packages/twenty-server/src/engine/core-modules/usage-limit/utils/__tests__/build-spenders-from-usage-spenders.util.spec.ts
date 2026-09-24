import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';

describe('buildSpendersFromUsageSpenders', () => {
  it('always charges the workspace', () => {
    expect(buildSpendersFromUsageSpenders({})).toEqual([
      { spenderType: 'workspace', spenderId: '' },
    ]);
  });

  it('maps every defined id to its spender type', () => {
    const spenders = buildSpendersFromUsageSpenders({
      userWorkspaceId: 'user-1',
      apiKeyId: 'api-key-1',
      applicationId: 'app-1',
      agentId: 'agent-1',
      workflowId: 'workflow-1',
      logicFunctionId: 'logic-function-1',
    });

    expect(spenders).toEqual([
      { spenderType: 'userWorkspace', spenderId: 'user-1' },
      { spenderType: 'apiKey', spenderId: 'api-key-1' },
      { spenderType: 'application', spenderId: 'app-1' },
      { spenderType: 'agent', spenderId: 'agent-1' },
      { spenderType: 'workflow', spenderId: 'workflow-1' },
      { spenderType: 'logicFunction', spenderId: 'logic-function-1' },
      { spenderType: 'workspace', spenderId: '' },
    ]);
  });

  it('ignores null and empty ids', () => {
    const spenders = buildSpendersFromUsageSpenders({
      userWorkspaceId: null,
      apiKeyId: '',
      workflowId: 'workflow-1',
    });

    expect(spenders).toEqual([
      { spenderType: 'workflow', spenderId: 'workflow-1' },
      { spenderType: 'workspace', spenderId: '' },
    ]);
  });
});
