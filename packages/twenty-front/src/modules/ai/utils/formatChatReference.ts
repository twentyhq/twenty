import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { getChatReferenceCloseTag } from '@/ai/utils/getChatReferenceCloseTag';
import { getChatReferenceIdentitySegment } from '@/ai/utils/getChatReferenceIdentitySegment';
import { formatRecordReference } from 'twenty-shared/ai';

export const formatChatReference = (
  reference: ChatReferenceIdentity & { displayName: string },
): string => {
  if (reference.kind === 'record') {
    return formatRecordReference(reference);
  }

  return `[[${reference.kind}:${getChatReferenceIdentitySegment(reference)}:${reference.displayName}${getChatReferenceCloseTag(reference.kind)}`;
};
