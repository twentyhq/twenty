import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

const THREAD_REPLIES_FETCH_LIMIT = 100;
const THREAD_REPLIES_MAX_PAGES = 10;

export type SlackMessage = {
  user: string | undefined;
  text: string | undefined;
};

// `conversations.replies` on the parent timestamp covers every shape the
// assistant sees: a top-level message is its own parent and comes back as the
// only entry, a threaded mention comes back among the replies.
export const findSlackMessage = async ({
  client,
  slackChannelId,
  parentMessageTimestamp,
  messageTimestamp,
}: {
  client: WebClient;
  slackChannelId: string;
  parentMessageTimestamp: string;
  messageTimestamp: string;
}): Promise<SlackMessage | undefined> => {
  try {
    let cursor: string | undefined;

    for (let page = 0; page < THREAD_REPLIES_MAX_PAGES; page++) {
      const replies = await client.conversations.replies({
        channel: slackChannelId,
        ts: parentMessageTimestamp,
        limit: THREAD_REPLIES_FETCH_LIMIT,
        cursor,
      });

      const message = (replies.messages ?? []).find(
        (candidate) => candidate.ts === messageTimestamp,
      );

      if (isDefined(message)) {
        return { user: message.user, text: message.text };
      }

      const nextCursor = replies.response_metadata?.next_cursor;

      if (!isNonEmptyString(nextCursor)) {
        return undefined;
      }

      cursor = nextCursor;
    }

    return undefined;
  } catch {
    return undefined;
  }
};
