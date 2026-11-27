import { getChatReferenceIdentitySegment } from '@/ai-chat/message-content/utils/getChatReferenceIdentitySegment';
import {
  type ChatReferenceIdentity,
  formatRecordReference,
} from 'twenty-shared/ai';

export const formatChatReference = (
  reference: ChatReferenceIdentity & { displayName: string },
): string => {
  if (reference.kind === 'record') {
    return formatRecordReference(reference);
  }

  return `[[${reference.kind}:${getChatReferenceIdentitySegment(reference)}:${reference.displayName}]]`;
};
