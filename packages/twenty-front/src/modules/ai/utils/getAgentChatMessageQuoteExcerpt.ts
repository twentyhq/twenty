import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH } from '@/ai/constants/AiChatQuoteExcerptMaxLength';

// a reply starts with the quote it answers, which is not part of what its author said
const LEADING_QUOTE_REGEX = /^(?:>[^\n]*\n?)+/;

export const getAgentChatMessageQuoteExcerpt = (
  message: Pick<ExtendedUIMessage, 'parts'>,
) => {
  // an assistant turn interleaves text with tool calls, so all its text parts are what it said
  const fullText = message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text.trim()] : []))
    .filter(isNonEmptyString)
    .join('\n\n');
  const textWithoutLeadingQuote = fullText
    .replace(LEADING_QUOTE_REGEX, '')
    .trim();
  const text = isNonEmptyString(textWithoutLeadingQuote)
    ? textWithoutLeadingQuote
    : fullText;

  return text.length > AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH
    ? `${text.slice(0, AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH).trimEnd()}…`
    : text;
};
