import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type AgentChatThreadTargetRecord = ObjectRecord & {
  threadId: string;
  thread?: AgentChatThreadRecord | null;
};
