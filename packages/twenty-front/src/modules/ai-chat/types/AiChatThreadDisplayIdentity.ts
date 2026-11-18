import { type AiChatThreadRecord } from '@/ai-chat/types/AiChatThreadRecord';

export type AiChatThreadDisplayIdentity = Pick<
  AiChatThreadRecord,
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
>;
