import { escapeMarkdownForChatReference } from '@/ai/utils/escapeMarkdownForChatReference';
import { formatChatReference } from '@/ai/utils/formatChatReference';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';

export const protectChatReferencesForMarkdown = (text: string): string => {
  const segments = getChatReferenceSegments(text);

  if (segments.length === 1 && typeof segments[0] === 'string') {
    return text;
  }

  return segments
    .map((segment) =>
      typeof segment === 'string'
        ? segment
        : formatChatReference({
            ...segment,
            displayName: escapeMarkdownForChatReference(segment.displayName),
          }),
    )
    .join('');
};
