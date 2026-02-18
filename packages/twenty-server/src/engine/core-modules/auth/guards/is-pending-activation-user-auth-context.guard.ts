import {
  type PendingActivationUserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isPendingActivationUserAuthContext = (
  context: WorkspaceAuthContext,
): context is PendingActivationUserWorkspaceAuthContext => {
  return context.type === 'pendingActivationUser';
};
