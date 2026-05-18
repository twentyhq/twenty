export type SupabaseWebhookEventType =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'UNKNOWN';

export type SupabaseWebhookPayload = {
  type?: SupabaseWebhookEventType | string;
  table?: string;
  schema?: string;
  record?: Record<string, unknown> | null;
  old_record?: Record<string, unknown> | null;
};
