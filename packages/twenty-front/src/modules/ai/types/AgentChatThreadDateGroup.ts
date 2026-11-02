import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type AgentChatThreadDateGroup = {
  id: string;
  title: string;
  threads: AgentChatThreadRecord[];
};
