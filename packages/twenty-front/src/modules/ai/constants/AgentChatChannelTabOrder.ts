import { AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';
import { type AgentChatChannelTab } from '@/ai/types/AgentChatChannelTab';

// Unassigned comes first because it is the only one that is nobody's yet.
export const AGENT_CHAT_CHANNEL_TAB_ORDER: AgentChatChannelTab[] = [
  AGENT_CHAT_CHANNEL_TAB.UNASSIGNED,
  AGENT_CHAT_CHANNEL_TAB.ASSIGNED,
  AGENT_CHAT_CHANNEL_TAB.SNOOZED,
  AGENT_CHAT_CHANNEL_TAB.DONE,
];
