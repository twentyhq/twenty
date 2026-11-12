import { PROTECTED_CHAT_REFERENCE_MARKER } from '@/ai/constants/ProtectedChatReferenceMarker';
import { escapeMarkdownForChatReference } from '@/ai/utils/escapeMarkdownForChatReference';
import { formatChatReference } from '@/ai/utils/formatChatReference';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { getMarkdownTextChatReferences } from 'twenty-shared/markdown';

const escapeChatReferenceBrackets = (reference: string): string =>
  `\\[\\[${reference.slice(2, -2)}\\]\\]`;

export const protectChatReferencesForMarkdown = (text: string): string => {
  const unmarkedText = text.replaceAll(PROTECTED_CHAT_REFERENCE_MARKER, '');
  const segments = getChatReferenceSegments(unmarkedText);

  if (segments.length === 1 && typeof segments[0] === 'string') {
    return segments[0];
  }

  const markdownTextReferenceIndexes = new Set(
    getMarkdownTextChatReferences(unmarkedText).map(({ index }) => index),
  );

  return segments
    .map((segment) => {
      if (typeof segment === 'string') {
        return segment;
      }

      if (!markdownTextReferenceIndexes.has(segment.index)) {
        return segment.fullMatch;
      }

      return `${PROTECTED_CHAT_REFERENCE_MARKER}${escapeChatReferenceBrackets(
        formatChatReference({
          ...segment,
          displayName: escapeMarkdownForChatReference(segment.displayName),
        }),
      )}`;
    })
    .join('');
};
