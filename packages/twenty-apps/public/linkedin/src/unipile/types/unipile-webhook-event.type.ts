import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileProvider } from 'src/unipile/types/unipile-provider.type';

type UnipileWebhookEventEnvelope = {
  id: string;
  created_at: string;
  account_id: string;
  account_provider: UnipileProvider;
};

export type UnipileWebhookEvent = UnipileWebhookEventEnvelope &
  (
    | { type: 'message.new'; payload: UnipileMessage }
    | { type: 'chat.update'; payload: { id?: string; chat_id?: string } }
    | {
        type: 'account.status.disconnected' | 'account.status.errored';
        payload: unknown;
      }
  );
