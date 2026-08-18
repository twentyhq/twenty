import { resolveApplicationCallerIdentity } from 'src/engine/core-modules/application/application-caller-permission/utils/resolve-application-caller-identity.util';

describe('resolveApplicationCallerIdentity', () => {
  it('should resolve a user caller to its user workspace', () => {
    expect(
      resolveApplicationCallerIdentity({
        caller: {
          type: 'user',
          userId: 'user-1',
          userWorkspaceId: 'user-workspace-1',
        },
      }),
    ).toEqual({ userWorkspaceId: 'user-workspace-1' });
  });

  it('should resolve an api key caller to its api key', () => {
    expect(
      resolveApplicationCallerIdentity({
        caller: { type: 'apiKey', apiKeyId: 'api-key-1' },
      }),
    ).toEqual({ apiKeyId: 'api-key-1' });
  });

  it('should prefer the caller claim over the token user workspace', () => {
    expect(
      resolveApplicationCallerIdentity({
        caller: {
          type: 'user',
          userId: 'user-1',
          userWorkspaceId: 'user-workspace-1',
        },
        tokenUserWorkspaceId: 'user-workspace-2',
      }),
    ).toEqual({ userWorkspaceId: 'user-workspace-1' });
  });

  it('should fall back to the user the token was minted for', () => {
    expect(
      resolveApplicationCallerIdentity({
        tokenUserWorkspaceId: 'user-workspace-2',
      }),
    ).toEqual({ userWorkspaceId: 'user-workspace-2' });
  });

  it('should return undefined when the token identifies no caller', () => {
    expect(resolveApplicationCallerIdentity({})).toBeUndefined();
  });
});
