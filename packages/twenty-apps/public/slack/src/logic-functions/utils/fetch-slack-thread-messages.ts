import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';

const THREAD_REPLIES_FETCH_LIMIT = 100;
const THREAD_REPLIES_MAX_PAGES = 10;

// A top-level message is its own parent and comes back as the only entry, so
// this covers every shape the assistant sees. Undefined means the thread could
// not be read, which is not the same as a thread with nothing in it.
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

    // Slack pages a thread oldest first, so stopping at the cap leaves the
    // newest turns unread. Returning what we have would present ancient
    // messages as the recent conversation, so treat it as unreadable instead.
    return undefined;
  } catch {
    return undefined;
  }
};
