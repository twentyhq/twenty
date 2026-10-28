import { type UnipileProvider } from 'src/unipile/types/unipile-provider.type';

export type UnipileWebhookEvent<TPayload = unknown> = {
  id: string;
  created_at: string;
  account_id: string;
  account_provider: UnipileProvider;
  type: string;
  payload: TPayload;
};
