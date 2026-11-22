import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type AiChatFileUIPart } from '@/ai-chat/types/AiChatFileUIPart';

export const createOptimisticAiChatUserMessage = ({
  messageId,
  text,
  attachments,
  createdAt,
  senderWorkspaceMemberId,
}: {
  messageId: string;
  text: string;
  attachments: AiChatFileUIPart[];
  createdAt: string;
  senderWorkspaceMemberId: string | undefined;
}): ExtendedUIMessage => ({
  id: messageId,
  role: 'user',
  parts: [{ type: 'text' as const, text }, ...attachments],
  metadata: {
    createdAt,
    senderWorkspaceMemberId,
  },
  status: 'sent',
});
