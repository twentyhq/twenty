import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

const CONTEXT_MESSAGE_LIMIT = 15;
// conversations.replies pages from the start of the thread, so fetch a wider
// window and keep the tail to stay on the most recent turns
const THREAD_REPLIES_FETCH_LIMIT = 100;

type SlackContextMessage = {
  ts?: string;
  user?: string;
  bot_id?: string;
  text?: string;
};

const formatContextMessages = ({
  messages,
  excludeMessageTimestamps,
  excludeMessageTexts,
}: {
  messages: ReadonlyArray<SlackContextMessage>;
  excludeMessageTimestamps: Set<string>;
  excludeMessageTexts: Set<string>;
}): string =>
  messages
    .filter((message) => {
      if (
        isNonEmptyString(message.ts) &&
        excludeMessageTimestamps.has(message.ts)
      ) {
        return false;
      }

      if (
        isNonEmptyString(message.text) &&
        excludeMessageTexts.has(message.text)
      ) {
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

export const fetchSlackConversationContext = async ({
  client,
  channelId,
  threadTimestamp,
  excludeMessageTimestamps = [],
  excludeMessageTexts = [],
}: {
  client: WebClient;
  channelId: string;
  threadTimestamp: string;
  excludeMessageTimestamps?: string[];
  excludeMessageTexts?: string[];
}): Promise<string | undefined> => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );
  const excludedTexts = new Set(excludeMessageTexts.filter(isNonEmptyString));

  try {
    const replies = await client.conversations.replies({
      channel: channelId,
      ts: threadTimestamp,
      limit: THREAD_REPLIES_FETCH_LIMIT,
    });

    return formatContextMessages({
      messages: replies.messages ?? [],
      excludeMessageTimestamps: excludedTimestamps,
      excludeMessageTexts: excludedTexts,
    });
  } catch {
    return undefined;
  }
};
