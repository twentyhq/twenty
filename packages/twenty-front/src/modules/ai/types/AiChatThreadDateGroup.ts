import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

export type AiChatThreadDateGroup = {
  id: string;
  title: string;
  threads: AiChatThreadRecord[];
};
