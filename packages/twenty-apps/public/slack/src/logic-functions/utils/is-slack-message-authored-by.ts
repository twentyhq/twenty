import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

const THREAD_REPLIES_FETCH_LIMIT = 100;
const THREAD_REPLIES_MAX_PAGES = 10;

// Actor metadata is caller-controllable, so it cannot prove a request really
// came from the person it names. Slack can: only Slack decides who posted a
// message at a given timestamp. Asking it is the one check a hand-written
// slackAssistantRequest cannot forge, and run-as depends on it.
//
// `conversations.replies` on the parent timestamp covers every shape the
// assistant sees: a top-level message is its own parent and comes back as the
// only entry, a threaded mention comes back among the replies.
export const isSlackMessageAuthoredBy = async ({
  client,
  slackChannelId,
  parentMessageTimestamp,
  messageTimestamp,
  slackUserId,
}: {
  client: WebClient;
  slackChannelId: string;
  parentMessageTimestamp: string;
  messageTimestamp: string;
  slackUserId: string;
}): Promise<boolean> => {
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
        return message.user === slackUserId;
      }

      const nextCursor = replies.response_metadata?.next_cursor;

      if (!isNonEmptyString(nextCursor)) {
        return false;
      }

      cursor = nextCursor;
    }

    return false;
  } catch {
    return false;
  }
};
