import { canListHiddenAvailableWorkspaces } from 'src/engine/core-modules/auth/utils/can-list-hidden-available-workspaces.util';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

describe('canListHiddenAvailableWorkspaces', () => {
  it('should allow a member browsing from inside a workspace', () => {
    expect(
      canListHiddenAvailableWorkspaces({
        isWorkspaceScopedCredential: true,
        authProvider: AuthProviderEnum.Password,
      }),
    ).toBe(true);
  });

  it('should deny a workspace-agnostic credential, which is the root-domain picker', () => {
    expect(
      canListHiddenAvailableWorkspaces({
        isWorkspaceScopedCredential: false,
        authProvider: AuthProviderEnum.Password,
      }),
    ).toBe(false);
  });

  it('should deny an impersonated session', () => {
    expect(
      canListHiddenAvailableWorkspaces({
        isWorkspaceScopedCredential: true,
        authProvider: AuthProviderEnum.Impersonation,
      }),
    ).toBe(false);
  });
});
