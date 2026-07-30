import { type ChatReferenceKind } from '@/ai/types/ChatReferenceKind';

export const getChatReferenceCloseTag = (kind: ChatReferenceKind): string =>
  `[[/${kind}]]`;
