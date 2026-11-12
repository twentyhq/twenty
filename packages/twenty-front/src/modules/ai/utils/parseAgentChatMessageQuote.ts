import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatMessageQuote } from '@/ai/types/AgentChatMessageQuote';

const QUOTE_HEADER_REGEX = /^\*\*(.+?):\*\* ?([\s\S]*)$/;

// reads back the quote written by prependAgentChatQuoteToText
export const parseAgentChatMessageQuote = (
  text: string,
): AgentChatMessageQuote | null => {
  const lines = text.split('\n');
  const quoteLineCount = lines.findIndex((line) => !line.startsWith('>'));

  if (quoteLineCount <= 0 || lines[quoteLineCount] !== '') {
    return null;
  }

  const quote = lines
    .slice(0, quoteLineCount)
    .map((line) => line.replace(/^> ?/, ''))
    .join('\n');
  const quoteHeaderMatch = quote.match(QUOTE_HEADER_REGEX);
  const replyText = lines
    .slice(quoteLineCount + 1)
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
