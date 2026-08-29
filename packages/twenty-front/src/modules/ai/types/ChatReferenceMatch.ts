import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';

export type ChatReferenceMatch = ChatReferenceIdentity & {
  fullMatch: string;
  index: number;
  displayName: string;
};
