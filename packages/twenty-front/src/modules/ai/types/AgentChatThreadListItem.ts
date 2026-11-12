import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type AgentChatThreadListItem = Pick<
  AgentChatThreadRecord,
  | 'id'
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
  | 'deletedAt'
  | 'lastActivityAt'
>;
