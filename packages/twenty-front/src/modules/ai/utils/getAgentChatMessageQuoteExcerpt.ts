import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH } from '@/ai/constants/AiChatQuoteExcerptMaxLength';
import { parseAgentChatMessageQuote } from '@/ai/utils/parseAgentChatMessageQuote';

// matching a reply rescans the thread on every streamed chunk, while only the streaming message changes
const EXCERPT_BY_MESSAGE = new WeakMap<
  Pick<ExtendedUIMessage, 'parts'>,
  string
>();

const computeAgentChatMessageQuoteExcerpt = (
  message: Pick<ExtendedUIMessage, 'parts'>,
) => {
  // an assistant turn interleaves text with tool calls, so all its text parts are what it said
  const fullText = message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text.trim()] : []))
    .filter(isNonEmptyString)
    .join('\n\n');
  // a reply starts with the quote it answers, which is not part of what its author said
  const text = parseAgentChatMessageQuote(fullText)?.replyText ?? fullText;

  return text.length > AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH
    ? `${text.slice(0, AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH).trimEnd()}…`
    : text;
};

export const getAgentChatMessageQuoteExcerpt = (
  message: Pick<ExtendedUIMessage, 'parts'>,
) => {
  const cachedExcerpt = EXCERPT_BY_MESSAGE.get(message);

  if (isDefined(cachedExcerpt)) {
    return cachedExcerpt;
  }

  const excerpt = computeAgentChatMessageQuoteExcerpt(message);

  EXCERPT_BY_MESSAGE.set(message, excerpt);

  return excerpt;
};
