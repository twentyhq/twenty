import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH } from '@/ai/constants/AiChatQuoteExcerptMaxLength';
import { parseAiChatMessageQuote } from '@/ai/utils/parseAgentChatMessageQuote';

// matching a reply rescans the thread on every streamed chunk, while only the streaming message changes
const EXCERPT_BY_MESSAGE = new WeakMap<
  Pick<ExtendedUIMessage, 'parts'>,
  string
>();

const computeAiChatMessageQuoteExcerpt = (
  message: Pick<ExtendedUIMessage, 'parts'>,
) => {
  const fullText = message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text.trim()] : []))
    .filter(isNonEmptyString)
    .join('\n\n');
  const text = parseAiChatMessageQuote(fullText)?.replyText ?? fullText;

  return text.length > AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH
    ? `${text.slice(0, AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH).trimEnd()}…`
    : text;
};

export const getAiChatMessageQuoteExcerpt = (
  message: Pick<ExtendedUIMessage, 'parts'>,
) => {
  const cachedExcerpt = EXCERPT_BY_MESSAGE.get(message);

  if (isDefined(cachedExcerpt)) {
    return cachedExcerpt;
  }

  const excerpt = computeAiChatMessageQuoteExcerpt(message);

  EXCERPT_BY_MESSAGE.set(message, excerpt);

  return excerpt;
};
