import { PROTECTED_CHAT_REFERENCE_MARKER } from '@/ai/constants/ProtectedChatReferenceMarker';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { isString } from '@sniptt/guards';

export const getProtectedChatReferenceSegments = (
  text: string,
): Array<string | ChatReferenceMatch> =>
  getChatReferenceSegments(text)
    .map((segment) => {
      if (isString(segment)) {
        return segment.replaceAll(PROTECTED_CHAT_REFERENCE_MARKER, '');
      }

      return text[segment.index - 1] === PROTECTED_CHAT_REFERENCE_MARKER
        ? segment
        : segment.fullMatch;
    })
    .filter((segment) => segment !== '');
