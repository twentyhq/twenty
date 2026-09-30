import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type AgentChatThreadRecord = ObjectRecord & {
  title: string | null;
  archivedAt: string | null;
  updatedAt: string;
};
