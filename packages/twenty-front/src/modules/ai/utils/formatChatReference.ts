import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { getChatReferenceCloseTag } from '@/ai/utils/getChatReferenceCloseTag';
import { getChatReferenceIdentitySegment } from '@/ai/utils/getChatReferenceIdentitySegment';

export const formatChatReference = (
  reference: ChatReferenceIdentity & { displayName: string },
): string =>
  `[[${reference.kind}:${getChatReferenceIdentitySegment(reference)}:${reference.displayName}${getChatReferenceCloseTag(reference.kind)}`;
