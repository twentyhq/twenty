import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';

export type ChatReferenceTextMatch = {
  index: number;
  length: number;
  reference: ChatReferenceMatch;
};
