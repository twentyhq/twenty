import { buildLogicFunctionInvokingUser } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-logic-function-invoking-user.util';

describe('buildLogicFunctionInvokingUser', () => {
  it('should build an invoking user when both ids are present', () => {
    expect(
      buildLogicFunctionInvokingUser({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
      }),
    ).toEqual({ userId: 'user-1', userWorkspaceId: 'user-workspace-1' });
  });

  it('should return undefined when the user id is missing', () => {
    expect(
      buildLogicFunctionInvokingUser({
        userWorkspaceId: 'user-workspace-1',
      }),
    ).toBeUndefined();
  });

  it('should return undefined when the user workspace id is null', () => {
    expect(
      buildLogicFunctionInvokingUser({
        userId: 'user-1',
        userWorkspaceId: null,
      }),
    ).toBeUndefined();
  });
});
