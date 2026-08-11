import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';

const THREAD_REPLIES_FETCH_LIMIT = 100;
const THREAD_REPLIES_MAX_PAGES = 10;

export const fetchSlackThreadMessages = async ({
  client,
  slackChannelId,
  parentMessageTimestamp,
}: {
  client: WebClient;
  slackChannelId: string;
  parentMessageTimestamp: string;
}): Promise<SlackThreadMessage[] | undefined> => {
  try {
    const messages: SlackThreadMessage[] = [];
    let cursor: string | undefined;

    for (let page = 0; page < THREAD_REPLIES_MAX_PAGES; page++) {
      const replies = await client.conversations.replies({
        channel: slackChannelId,
        ts: parentMessageTimestamp,
        limit: THREAD_REPLIES_FETCH_LIMIT,
        cursor,
      });

      messages.push(...(replies.messages ?? []));

      const nextCursor = replies.response_metadata?.next_cursor;

      if (!isNonEmptyString(nextCursor)) {
        return messages;
      }

      cursor = nextCursor;
    }

    return undefined;
  } catch {
    return undefined;
  }
};
