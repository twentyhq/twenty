import { resolveInvokingUserWorkspaceId } from 'src/engine/core-modules/application/application-invoking-user-permission/utils/resolve-invoking-user-workspace-id.util';

describe('resolveInvokingUserWorkspaceId', () => {
  it('should prefer the invoking user claim', () => {
    expect(
      resolveInvokingUserWorkspaceId({
        invokingUser: {
          userId: 'user-1',
          userWorkspaceId: 'user-workspace-1',
        },
        tokenUserWorkspaceId: 'user-workspace-2',
      }),
    ).toBe('user-workspace-1');
  });

  it('should fall back to the token user workspace id without a claim', () => {
    expect(
      resolveInvokingUserWorkspaceId({
        tokenUserWorkspaceId: 'user-workspace-2',
      }),
    ).toBe('user-workspace-2');
  });

  it('should resolve nothing when neither identity exists', () => {
    expect(resolveInvokingUserWorkspaceId({})).toBeUndefined();
  });
});
