import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type AgentChatThreadRecord = ObjectRecord & {
  title: string | null;
  deletedAt: string | null;
  updatedAt: string;
};
