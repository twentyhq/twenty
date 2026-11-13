import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type AiChatThreadDateGroup = {
  id: string;
  title: string;
  threads: AiChatThreadRecord[];
};
