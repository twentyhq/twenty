import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type AgentChatThreadDisplayIdentity = Pick<
  AgentChatThreadRecord,
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
>;
