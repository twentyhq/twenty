import { buildLogicFunctionCaller } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-logic-function-caller.util';

describe('buildLogicFunctionCaller', () => {
  it('should build a user caller when userId and userWorkspaceId are present', () => {
    expect(
      buildLogicFunctionCaller({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
        workspaceMemberId: 'workspace-member-1',
      }),
    ).toEqual({
      kind: 'user',
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
      workspaceMemberId: 'workspace-member-1',
    });
  });

  it('should omit workspaceMemberId when it is not resolved', () => {
    expect(
      buildLogicFunctionCaller({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
      }),
    ).toEqual({
      kind: 'user',
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
    });
  });

  it('should build an api key caller when only an api key is present', () => {
    expect(buildLogicFunctionCaller({ apiKeyId: 'api-key-1' })).toEqual({
      kind: 'apiKey',
      apiKeyId: 'api-key-1',
    });
  });

  it('should prefer the user identity over an api key', () => {
    expect(
      buildLogicFunctionCaller({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
        apiKeyId: 'api-key-1',
      }),
    ).toEqual({
      kind: 'user',
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
    });
  });

  it('should return undefined when no identity is present', () => {
    expect(buildLogicFunctionCaller({})).toBeUndefined();
    expect(
      buildLogicFunctionCaller({ userId: 'user-1', userWorkspaceId: null }),
    ).toBeUndefined();
  });
});
