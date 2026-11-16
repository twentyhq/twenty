import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

export type AiChatThreadDisplayIdentity = Pick<
  AiChatThreadRecord,
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
>;
