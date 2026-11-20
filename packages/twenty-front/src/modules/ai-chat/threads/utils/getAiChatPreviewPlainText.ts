import { isString } from '@sniptt/guards';
import { isAgentChatAssistantReference } from 'twenty-shared/ai';

import { escapeMarkdownForChatReference } from '@/ai-chat/message-content/utils/escapeMarkdownForChatReference';
import { getChatReferenceSegments } from '@/ai-chat/message-content/utils/getChatReferenceSegments';
import { getPlainTextFromMarkdown } from '~/utils/string/getPlainTextFromMarkdown';

// The server cuts the text short, which can leave half a reference at the end
export const getAiChatPreviewPlainText = ({
  markdown,
  assistantDisplayName,
}: {
  markdown: string;
  assistantDisplayName: string;
}): string =>
  getPlainTextFromMarkdown(
    getChatReferenceSegments(markdown)
      .map((segment) => {
        if (isString(segment)) {
          return segment;
        }

        if (isAgentChatAssistantReference(segment)) {
          return escapeMarkdownForChatReference(`@${assistantDisplayName}`);
        }

        return segment.displayName;
      })
      .join('')
      .replace(/\[\[[^\]]*$/, ''),
  );
