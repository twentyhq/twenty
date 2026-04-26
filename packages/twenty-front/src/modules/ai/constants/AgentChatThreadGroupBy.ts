export const AGENT_CHAT_THREAD_GROUP_BY = {
  DATE: 'date',
  NONE: 'none',
} as const;

export type AgentChatThreadGroupBy =
  (typeof AGENT_CHAT_THREAD_GROUP_BY)[keyof typeof AGENT_CHAT_THREAD_GROUP_BY];
