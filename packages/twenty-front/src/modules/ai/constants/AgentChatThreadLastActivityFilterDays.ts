import { type AgentChatThreadLastActivityFilter } from '@/ai/types/AgentChatThreadLastActivityFilter';

export const AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS: Record<
  AgentChatThreadLastActivityFilter,
  number | null
> = {
  all: null,
  '1d': 1,
  '3d': 3,
  '7d': 7,
  '30d': 30,
};
