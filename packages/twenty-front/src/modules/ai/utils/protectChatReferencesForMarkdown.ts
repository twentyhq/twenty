import { PROTECTED_CHAT_REFERENCE_MARKER } from '@/ai/constants/ProtectedChatReferenceMarker';
import { escapeMarkdownForChatReference } from '@/ai/utils/escapeMarkdownForChatReference';
import { formatChatReference } from '@/ai/utils/formatChatReference';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { getChatReferencesInMarkdownText } from '@/ai/utils/getChatReferencesInMarkdownText';

export const protectChatReferencesForMarkdown = (text: string): string => {
  const unmarkedText = text.replaceAll(PROTECTED_CHAT_REFERENCE_MARKER, '');
  const segments = getChatReferenceSegments(unmarkedText);

  if (segments.length === 1 && typeof segments[0] === 'string') {
    return segments[0];
  }

  const referencesInMarkdownText = new Set(
    getChatReferencesInMarkdownText({
      text: unmarkedText,
      references: segments.filter((segment) => typeof segment !== 'string'),
    }),
  );

  return segments
    .map((segment) => {
      if (typeof segment === 'string') {
        return segment;
      }

      if (!referencesInMarkdownText.has(segment)) {
        return segment.fullMatch;
      }

      return `${PROTECTED_CHAT_REFERENCE_MARKER}${formatChatReference({
        ...segment,
        displayName: escapeMarkdownForChatReference(segment.displayName),
      })}`;
    })
    .join('');
};
