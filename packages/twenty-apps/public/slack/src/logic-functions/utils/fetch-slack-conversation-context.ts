import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

const CONTEXT_MESSAGE_LIMIT = 15;
// conversations.replies pages from the start of the thread, so walk every page
// and keep the tail to stay on the most recent turns
const THREAD_REPLIES_FETCH_LIMIT = 100;
const THREAD_REPLIES_MAX_PAGES = 10;

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
  messages: ReadonlyArray<SlackContextMessage>;
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
}: {
  client: WebClient;
  channelId: string;
  threadTimestamp: string;
  excludeMessageTimestamps?: string[];
}): Promise<string | undefined> => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );

  try {
    const messages: SlackContextMessage[] = [];
    let cursor: string | undefined;

    for (let page = 0; page < THREAD_REPLIES_MAX_PAGES; page++) {
      const replies = await client.conversations.replies({
        channel: channelId,
        ts: threadTimestamp,
        limit: THREAD_REPLIES_FETCH_LIMIT,
        cursor,
      });

      messages.push(...(replies.messages ?? []));

      const nextCursor = replies.response_metadata?.next_cursor;

      if (!isNonEmptyString(nextCursor)) {
        break;
      }

      cursor = nextCursor;
    }

    return formatContextMessages({
      messages,
      excludeMessageTimestamps: excludedTimestamps,
    });
  } catch {
    return undefined;
  }
};
