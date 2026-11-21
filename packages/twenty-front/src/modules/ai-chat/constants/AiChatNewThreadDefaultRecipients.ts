import { type AiChatNewThreadRecipients } from '@/ai-chat/types/AiChatNewThreadRecipients';

export const AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS: AiChatNewThreadRecipients =
  {
    channelId: null,
    isAssistantParticipant: true,
    recipientWorkspaceMemberIds: [],
  };
