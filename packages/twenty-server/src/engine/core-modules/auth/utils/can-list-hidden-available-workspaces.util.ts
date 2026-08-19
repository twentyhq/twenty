import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

// A HIDDEN workspace is kept out of the root-domain sign-in picker, which a
// workspace-agnostic credential is browsing. A workspace-scoped one belongs to a
// member who already knows the workspace, unless it was borrowed through
// impersonation: the impersonator is not a member of the other workspaces.
export const canListHiddenAvailableWorkspaces = ({
  isWorkspaceScopedCredential,
  authProvider,
}: {
  isWorkspaceScopedCredential: boolean;
  authProvider: AuthProviderEnum;
}): boolean =>
  isWorkspaceScopedCredential &&
  authProvider !== AuthProviderEnum.Impersonation;
