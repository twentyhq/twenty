import { type AgentChatNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';

export const AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS: AgentChatNewThreadRecipients =
  {
    isAssistantParticipant: true,
    recipientWorkspaceMemberIds: [],
  };
