import { type ChatThreadDraftAttachment } from '@/activities/emails/types/ChatThreadDraftAttachment';

export type PendingChatMessage = {
  id: string;
  text: string;
  attachments: ChatThreadDraftAttachment[];
  status: 'sending' | 'sent' | 'failed';
};
