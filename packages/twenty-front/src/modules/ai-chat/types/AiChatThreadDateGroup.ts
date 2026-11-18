import { type AiChatThreadRecord } from '@/ai-chat/types/AiChatThreadRecord';

export type AiChatThreadDateGroup = {
  id: string;
  title: string;
  threads: AiChatThreadRecord[];
};
