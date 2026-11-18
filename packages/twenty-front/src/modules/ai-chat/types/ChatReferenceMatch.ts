import { type ChatReferenceIdentity } from '@/ai-chat/types/ChatReferenceIdentity';

export type ChatReferenceMatch = ChatReferenceIdentity & {
  fullMatch: string;
  index: number;
  displayName: string;
};
