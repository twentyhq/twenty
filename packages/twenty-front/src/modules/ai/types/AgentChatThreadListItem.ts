import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type InboxThreadListItemData = Pick<
  InboxThreadRecord,
  | 'id'
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
  | 'deletedAt'
  | 'lastActivityAt'
>;
