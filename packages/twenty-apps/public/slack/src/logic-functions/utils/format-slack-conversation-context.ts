import { isNonEmptyString } from '@sniptt/guards';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';

const CONTEXT_MESSAGE_LIMIT = 15;

// A thread reads oldest first, so keeping the tail keeps the most recent turns.
export const formatSlackConversationContext = ({
  messages,
  excludeMessageTimestamps = [],
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  excludeMessageTimestamps?: string[];
}): string => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );

  return messages
    .filter((message) => {
      if (isNonEmptyString(message.ts) && excludedTimestamps.has(message.ts)) {
        return false;
      }

      return isNonEmptyString(message.text);
    })
    .slice(-CONTEXT_MESSAGE_LIMIT)
    .map((message) => {
      const author = isNonEmptyString(message.bot_id)
        ? 'assistant'
        : `<@${message.user ?? 'unknown'}>`;

      return `${author}: ${message.text}`;
    })
    .join('\n');
};
