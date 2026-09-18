import { type AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';

export type AgentChatChannelTab =
  (typeof AGENT_CHAT_CHANNEL_TAB)[keyof typeof AGENT_CHAT_CHANNEL_TAB];
