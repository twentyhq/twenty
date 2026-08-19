import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

export const canListHiddenAvailableWorkspaces = ({
  isWorkspaceScopedCredential,
  authProvider,
}: {
  isWorkspaceScopedCredential: boolean;
  authProvider: AuthProviderEnum;
}): boolean =>
  isWorkspaceScopedCredential &&
  authProvider !== AuthProviderEnum.Impersonation;
