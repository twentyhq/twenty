import {
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isUserAuthContext = (
  context: WorkspaceAuthContext,
): context is UserWorkspaceAuthContext => {
  return context.type === 'user';
};
