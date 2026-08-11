import { isNonEmptyString } from '@sniptt/guards';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';

const CONTEXT_MESSAGE_LIMIT = 15;

export const formatSlackConversationContext = ({
  messages,
  botUserId,
  excludeMessageTimestamps = [],
}: {
  messages: ReadonlyArray<SlackThreadMessage>;
  botUserId: string | undefined;
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
      const isOwnReply =
        isNonEmptyString(botUserId) && message.user === botUserId;

      const author = isOwnReply
        ? 'assistant'
        : `<@${message.user ?? 'unknown'}>`;

      return `${author}: ${message.text}`;
    })
    .join('\n');
};
