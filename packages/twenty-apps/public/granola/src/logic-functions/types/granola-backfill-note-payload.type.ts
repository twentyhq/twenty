import { type GranolaDeferredWebhook } from 'src/logic-functions/types/granola-deferred-webhook.type';

export type GranolaBackfillNotePayload = {
  registrationId: string;
  folderId?: string;
  noteId: string;
  updatedAt?: string;
  runDay?: string;
  deferredWebhook?: GranolaDeferredWebhook;
  retryAttempt?: number;
};
