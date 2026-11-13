import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type InboxThreadTargetRecord = ObjectRecord & {
  threadId: string;
  thread?: InboxThreadRecord | null;
};
