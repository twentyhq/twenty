import {
  type ApiKeyWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isApiKeyAuthContext = (
  context: WorkspaceAuthContext,
): context is ApiKeyWorkspaceAuthContext => {
  return context.type === 'apiKey';
};
