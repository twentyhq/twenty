import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

export type AiChatThreadUpdate = Partial<AiChatThreadRecord> & { id: string };
