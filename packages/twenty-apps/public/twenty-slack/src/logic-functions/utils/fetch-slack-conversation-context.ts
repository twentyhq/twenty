import { type WebClient } from '@slack/web-api';

import { isNonEmptyString } from '@sniptt/guards';

const CONTEXT_MESSAGE_LIMIT = 15;

type SlackContextMessage = {
  ts?: string;
  user?: string;
  bot_id?: string;
  text?: string;
};

const formatContextMessages = ({
  messages,
  excludeMessageTimestamps,
}: {
  messages: SlackContextMessage[];
  excludeMessageTimestamps: Set<string>;
}): string =>
  messages
    .filter((message) => {
      if (
        isNonEmptyString(message.ts) &&
        excludeMessageTimestamps.has(message.ts)
      ) {
        return false;
      }

      return isNonEmptyString(message.text);
    })
    .map((message) => {
      const author = isNonEmptyString(message.bot_id)
        ? 'assistant'
        : `<@${message.user ?? 'unknown'}>`;

      return `${author}: ${message.text}`;
    })
    .join('\n');

export const fetchSlackConversationContext = async ({
  client,
  channelId,
  threadTimestamp,
  isDirectMessage,
  excludeMessageTimestamps = [],
}: {
  client: WebClient;
  channelId: string;
  threadTimestamp: string;
  isDirectMessage: boolean;
  excludeMessageTimestamps?: string[];
}): Promise<string | undefined> => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );

  try {
    if (isNonEmptyString(threadTimestamp)) {
      const replies = await client.conversations.replies({
        channel: channelId,
        ts: threadTimestamp,
        limit: CONTEXT_MESSAGE_LIMIT,
      });

      return formatContextMessages({
        messages: (replies.messages ?? []) as SlackContextMessage[],
        excludeMessageTimestamps: excludedTimestamps,
      });
    }

    if (isDirectMessage) {
      const history = await client.conversations.history({
        channel: channelId,
        limit: CONTEXT_MESSAGE_LIMIT,
      });

      return formatContextMessages({
        messages: ((history.messages ?? []) as SlackContextMessage[]).reverse(),
        excludeMessageTimestamps: excludedTimestamps,
      });
    }

    return undefined;
  } catch {
    return undefined;
  }
};
