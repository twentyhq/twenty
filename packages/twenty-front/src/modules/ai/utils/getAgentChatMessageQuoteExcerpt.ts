import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH } from '@/ai/constants/AiChatQuoteExcerptMaxLength';

export const getAgentChatMessageQuoteExcerpt = (
  message: Pick<ExtendedUIMessage, 'parts'>,
) => {
  const text = (
    message.parts.find((part) => part.type === 'text')?.text ?? ''
  ).trim();

  return text.length > AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH
    ? `${text.slice(0, AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH).trimEnd()}…`
    : text;
};
