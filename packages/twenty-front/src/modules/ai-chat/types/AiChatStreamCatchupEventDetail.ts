import { type AiChatStreamCatchup } from '@/ai-chat/types/AiChatStreamCatchup';

export type AiChatStreamCatchupEventDetail = {
  threadId: string;
  catchup: AiChatStreamCatchup;
};
