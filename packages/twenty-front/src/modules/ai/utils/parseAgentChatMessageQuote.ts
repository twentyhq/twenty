import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatMessageQuote } from '@/ai/types/AgentChatMessageQuote';

const QUOTE_HEADER_REGEX = /^\*\*(.+?):\*\* ?([\s\S]*)$/;

// reads back the quote written by prependAiChatQuoteToText
export const parseAiChatMessageQuote = (
  text: string,
): AiChatMessageQuote | null => {
  const lines = text.split('\n');
  const firstReplyLineIndex = lines.findIndex((line) => !line.startsWith('>'));

  if (firstReplyLineIndex <= 0 || lines[firstReplyLineIndex] !== '') {
    return null;
  }

  const quote = lines
    .slice(0, firstReplyLineIndex)
    .map((line) => line.replace(/^> ?/, ''))
    .join('\n');
  const quoteHeaderMatch = quote.match(QUOTE_HEADER_REGEX);
  const replyText = lines
    .slice(firstReplyLineIndex + 1)
    .join('\n')
    .trim();

  if (!isDefined(quoteHeaderMatch) || !isNonEmptyString(replyText)) {
    return null;
  }

  return {
    authorName: quoteHeaderMatch[1],
    excerpt: quoteHeaderMatch[2],
    replyText,
  };
};
