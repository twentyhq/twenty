import { escapeMarkdownForChatReference } from '@/ai/utils/escapeMarkdownForChatReference';
import { formatChatReference } from '@/ai/utils/formatChatReference';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';

export const protectChatReferencesForMarkdown = (text: string): string =>
  getChatReferenceSegments(text)
    .map((segment) =>
      typeof segment === 'string'
        ? segment
        : formatChatReference({
            ...segment,
            displayName: escapeMarkdownForChatReference(segment.displayName),
          }),
    )
    .join('');
