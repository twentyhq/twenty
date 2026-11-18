import { type AiChatThreadRecord } from '@/ai-chat/types/AiChatThreadRecord';

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
