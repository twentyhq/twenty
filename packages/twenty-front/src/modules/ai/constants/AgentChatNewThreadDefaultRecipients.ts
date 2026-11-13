import { type InboxNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';

export const INBOX_NEW_THREAD_DEFAULT_RECIPIENTS: InboxNewThreadRecipients = {
  isAssistantParticipant: true,
  recipientWorkspaceMemberIds: [],
};
