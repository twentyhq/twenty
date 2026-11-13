import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type InboxThreadListItemData = Pick<
  AiChatThreadRecord,
  | 'id'
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
  | 'deletedAt'
  | 'lastActivityAt'
>;
