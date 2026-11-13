import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type InboxThreadTargetRecord = ObjectRecord & {
  threadId: string;
  thread?: InboxThreadRecord | null;
};
