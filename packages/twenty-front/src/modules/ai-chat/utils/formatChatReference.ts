import { type ChatReferenceIdentity } from '@/ai-chat/types/ChatReferenceIdentity';
import { getChatReferenceIdentitySegment } from '@/ai-chat/utils/getChatReferenceIdentitySegment';
import { formatRecordReference } from 'twenty-shared/ai';

export const formatChatReference = (
  reference: ChatReferenceIdentity & { displayName: string },
): string => {
  if (reference.kind === 'record') {
    return formatRecordReference(reference);
  }

  return `[[${reference.kind}:${getChatReferenceIdentitySegment(reference)}:${reference.displayName}]]`;
};
