import {
  type SystemWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isSystemAuthContext = (
  context: WorkspaceAuthContext,
): context is SystemWorkspaceAuthContext => {
  return context.type === 'system';
};
