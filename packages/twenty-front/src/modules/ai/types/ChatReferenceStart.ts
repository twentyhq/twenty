import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';

export type ChatReferenceStart = {
  index: number;
  prefixLength: number;
  openBracketLength: number;
  identity: ChatReferenceIdentity;
};
