import { isString } from '@sniptt/guards';
import { isAgentChatAssistantReference } from 'twenty-shared/ai';

import { escapeMarkdownForChatReference } from '@/ai/utils/escapeMarkdownForChatReference';
import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { getPlainTextFromMarkdown } from '~/utils/string/getPlainTextFromMarkdown';

// The server cuts the text short, which can leave half a reference at the end
export const getAgentChatPreviewPlainText = (markdown: string): string =>
  getPlainTextFromMarkdown(
    getChatReferenceSegments(markdown)
      .map((segment) => {
        if (isString(segment)) {
          return segment;
        }

        if (isAgentChatAssistantReference(segment)) {
          return escapeMarkdownForChatReference(`@${segment.displayName}`);
        }

        return segment.displayName;
      })
      .join('')
      .replace(/\[\[[^\]]*$/, ''),
  );
