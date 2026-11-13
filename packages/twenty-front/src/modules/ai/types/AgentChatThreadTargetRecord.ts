import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type AiChatThreadTargetRecord = ObjectRecord & {
  threadId: string;
  thread?: AiChatThreadRecord | null;
};
