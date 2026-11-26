import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

export type AiChatThreadDateGroup = {
  id: string;
  title: string;
  threads: AiChatThreadRecord[];
};
