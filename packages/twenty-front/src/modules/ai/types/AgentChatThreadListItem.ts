import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type AgentChatThreadListItem = Pick<
  AgentChatThreadRecord,
  'id' | 'title' | 'deletedAt' | 'lastActivityAt'
>;
