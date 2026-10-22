import { isString } from '@sniptt/guards';

import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';
import { getPlainTextFromMarkdown } from '~/utils/string/getPlainTextFromMarkdown';

// The server cuts the text short, which can leave half a reference at the end
export const getAgentChatPreviewPlainText = (markdown: string): string =>
  getPlainTextFromMarkdown(
    getChatReferenceSegments(markdown)
      .map((segment) => (isString(segment) ? segment : segment.displayName))
      .join('')
      .replace(/\[\[[^\]]*$/, ''),
  );
