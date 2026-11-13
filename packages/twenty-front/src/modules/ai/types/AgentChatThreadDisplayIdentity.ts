import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type InboxThreadDisplayIdentity = Pick<
  InboxThreadRecord,
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
>;
