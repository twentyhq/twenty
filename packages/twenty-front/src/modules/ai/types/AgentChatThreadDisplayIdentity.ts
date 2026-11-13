import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export type AiChatThreadDisplayIdentity = Pick<
  AiChatThreadRecord,
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
>;
