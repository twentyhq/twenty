import { escapeMarkdownForChatReference } from '@/ai/utils/escapeMarkdownForChatReference';
import { formatChatReference } from '@/ai/utils/formatChatReference';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { isString } from '@sniptt/guards';
import { isAgentChatAssistantReference } from 'twenty-shared/ai';

export const protectChatReferencesForMarkdown = (text: string): string => {
  const segments = getChatReferenceSegments(text);

  if (segments.length === 1 && isString(segments[0])) {
    return segments[0];
  }

  return segments
    .map((segment) => {
      if (isString(segment)) {
        return segment;
      }

      if (segment.kind === 'record' && isAgentChatAssistantReference(segment)) {
        return formatChatReference(segment);
      }

      return formatChatReference({
        ...segment,
        displayName: escapeMarkdownForChatReference(segment.displayName),
      });
    })
    .join('');
};
