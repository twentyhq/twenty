import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';

export type ChatReferenceStart = {
  index: number;
  prefixLength: number;
  identity: ChatReferenceIdentity;
};
