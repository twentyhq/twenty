import {
  type WebhookWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isWebhookAuthContext = (
  context: WorkspaceAuthContext,
): context is WebhookWorkspaceAuthContext => {
  return context.type === 'webhook';
};
