import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileProvider } from 'src/unipile/types/unipile-provider.type';

// only the ids are relied on: the message itself is refetched for its flags
type UnipileMessageReceipt = {
  chat_id?: string;
  message_id?: string;
  id?: string;
};

type UnipileWebhookEventEnvelope = {
  id: string;
  created_at: string;
  account_id: string;
  account_provider: UnipileProvider;
};

export type UnipileWebhookEvent = UnipileWebhookEventEnvelope &
  (
    | { type: 'message.new'; payload: UnipileMessage }
    | {
        type: 'message.receipt.read' | 'message.receipt.delivery';
        payload: UnipileMessageReceipt;
      }
    | {
        type: 'account.status.disconnected' | 'account.status.errored';
        payload: unknown;
      }
  );
