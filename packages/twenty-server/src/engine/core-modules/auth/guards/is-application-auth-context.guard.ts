import {
  type ApplicationWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isApplicationAuthContext = (
  context: WorkspaceAuthContext,
): context is ApplicationWorkspaceAuthContext => {
  return context.type === 'application';
};
