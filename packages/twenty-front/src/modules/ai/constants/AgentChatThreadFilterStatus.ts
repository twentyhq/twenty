export const AGENT_CHAT_THREAD_FILTER_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: 'all',
} as const;

export type AgentChatThreadFilterStatus =
  (typeof AGENT_CHAT_THREAD_FILTER_STATUS)[keyof typeof AGENT_CHAT_THREAD_FILTER_STATUS];
