import { type GranolaDeferredWebhook } from 'src/logic-functions/types/granola-deferred-webhook.type';

export type GranolaBackfillNotePayload = {
  registrationId: string;
  folderId?: string;
  noteId: string;
  deferredWebhook?: GranolaDeferredWebhook;
};
