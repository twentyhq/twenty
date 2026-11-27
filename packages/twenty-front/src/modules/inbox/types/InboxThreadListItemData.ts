import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

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
