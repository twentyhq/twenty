import { type LINKEDIN_HISTORY_CONVERSATION_LIMITS } from 'src/constants/linkedin-history-conversation-limits.constant';

export type LinkedinHistoryConversationLimit =
  (typeof LINKEDIN_HISTORY_CONVERSATION_LIMITS)[number];
