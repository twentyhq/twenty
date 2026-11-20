import { type ChatReferenceIdentity } from '@/ai-chat/message-content/types/ChatReferenceIdentity';

export type ChatReferenceMatch = ChatReferenceIdentity & {
  fullMatch: string;
  index: number;
  displayName: string;
};
