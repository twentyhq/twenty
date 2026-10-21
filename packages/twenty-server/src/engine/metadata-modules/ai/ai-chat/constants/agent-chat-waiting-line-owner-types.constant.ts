// owner types of their own, so findConversationWait never mistakes a waiter for a suspended run
export const AGENT_CHAT_WAITING_LINE_OWNER_TYPES = {
  RUN: 'AGENT_CHAT_WAITING_RUN',
  QUEUED_MESSAGES: 'AGENT_CHAT_QUEUED_MESSAGES',
} as const;
