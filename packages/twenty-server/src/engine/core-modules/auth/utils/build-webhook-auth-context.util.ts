import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { type WebhookWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';

export const buildWebhookAuthContext = ({
  workspace,
  webhook,
}: {
  workspace: NonNullable<RawAuthContext['workspace']>;
  webhook: FlatWebhook;
}): WebhookWorkspaceAuthContext => ({
  type: 'webhook',
  workspace,
  webhook,
});
