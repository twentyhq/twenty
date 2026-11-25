import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

export const getAiChatThreadLastActivityAt = (
  thread: Pick<AiChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
): string => thread.lastActivityAt ?? thread.updatedAt;
