import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';

// conversations.replies only pages forward from the start of the thread, so
// walk to the last page and keep a wide tail to stay on the most recent turns
const THREAD_REPLIES_PAGE_SIZE = 1000;
const THREAD_REPLIES_MAX_PAGES = 10;
const THREAD_REPLIES_TAIL_SIZE = 100;

type SlackThreadRead = {
  tailMessages: SlackThreadMessage[];
  requestMessage: SlackThreadMessage | undefined;
};

const EMPTY_THREAD_READ: SlackThreadRead = {
  tailMessages: [],
  requestMessage: undefined,
};

export const fetchSlackThreadMessages = async ({
  client,
  slackChannelId,
  parentMessageTimestamp,
  requestMessageTimestamp,
}: {
  client: WebClient;
  slackChannelId: string;
  parentMessageTimestamp: string;
  requestMessageTimestamp: string;
}): Promise<SlackThreadRead> => {
  try {
    let tailMessages: SlackThreadMessage[] = [];
    let requestMessage: SlackThreadMessage | undefined = undefined;
    let cursor: string | undefined = undefined;

    for (let page = 0; page < THREAD_REPLIES_MAX_PAGES; page++) {
      const replies = await client.conversations.replies({
        channel: slackChannelId,
        ts: parentMessageTimestamp,
        limit: THREAD_REPLIES_PAGE_SIZE,
        cursor,
      });

      const messages: SlackThreadMessage[] = replies.messages ?? [];

      tailMessages = [...tailMessages, ...messages].slice(
        -THREAD_REPLIES_TAIL_SIZE,
      );

      requestMessage =
        requestMessage ??
        messages.find((message) => message.ts === requestMessageTimestamp);

      cursor = replies.response_metadata?.next_cursor;

      if (!isNonEmptyString(cursor)) {
        return { tailMessages, requestMessage };
      }
    }

    // the tail is out of reach, and replaying the head of the thread as if it
    // were recent would mislead the agent more than having no history at all
    console.warn(
      `[slack] thread ${parentMessageTimestamp} is longer than ${THREAD_REPLIES_MAX_PAGES * THREAD_REPLIES_PAGE_SIZE} replies, skipping history`,
    );

    return { tailMessages: [], requestMessage };
  } catch {
    return EMPTY_THREAD_READ;
  }
};
