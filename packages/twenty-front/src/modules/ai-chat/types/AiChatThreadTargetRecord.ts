import { type AiChatThreadRecord } from '@/ai-chat/types/AiChatThreadRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type AiChatThreadTargetRecord = ObjectRecord & {
  threadId: string;
  thread?: AiChatThreadRecord | null;
};
