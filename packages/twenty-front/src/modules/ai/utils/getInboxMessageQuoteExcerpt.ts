import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_QUOTE_EXCERPT_MAX_LENGTH } from '@/ai/constants/InboxQuoteExcerptMaxLength';
import { parseInboxMessageQuote } from '@/ai/utils/parseInboxMessageQuote';

// matching a reply rescans the thread on every streamed chunk, while only the streaming message changes
const EXCERPT_BY_MESSAGE = new WeakMap<
  Pick<ExtendedUIMessage, 'parts'>,
  string
>();

const computeInboxMessageQuoteExcerpt = (
  message: Pick<ExtendedUIMessage, 'parts'>,
) => {
  const fullText = message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text.trim()] : []))
    .filter(isNonEmptyString)
    .join('\n\n');
  const text = parseInboxMessageQuote(fullText)?.replyText ?? fullText;

  return text.length > INBOX_QUOTE_EXCERPT_MAX_LENGTH
    ? `${text.slice(0, INBOX_QUOTE_EXCERPT_MAX_LENGTH).trimEnd()}…`
    : text;
};

export const getInboxMessageQuoteExcerpt = (
  message: Pick<ExtendedUIMessage, 'parts'>,
) => {
  const cachedExcerpt = EXCERPT_BY_MESSAGE.get(message);

  if (isDefined(cachedExcerpt)) {
    return cachedExcerpt;
  }

  const excerpt = computeInboxMessageQuoteExcerpt(message);

  EXCERPT_BY_MESSAGE.set(message, excerpt);

  return excerpt;
};
