import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

export type InboxThreadDisplayIdentity = Pick<
  InboxThreadRecord,
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
>;
