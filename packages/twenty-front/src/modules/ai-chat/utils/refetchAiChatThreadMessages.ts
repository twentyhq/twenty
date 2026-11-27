import { aiChatThreadStreams } from '@/ai-chat/utils/aiChatThreadStreams';

export const refetchAiChatThreadMessages = (threadId: string) =>
  aiChatThreadStreams.get(threadId)?.refetchMessages();
