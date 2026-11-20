import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

export type AiChatThreadDisplayIdentity = Pick<
  AiChatThreadRecord,
  | 'title'
  | 'conversationType'
  | 'directMessageFirstWorkspaceMemberId'
  | 'directMessageSecondWorkspaceMemberId'
>;
