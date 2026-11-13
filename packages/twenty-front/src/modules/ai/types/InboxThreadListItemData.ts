import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

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
