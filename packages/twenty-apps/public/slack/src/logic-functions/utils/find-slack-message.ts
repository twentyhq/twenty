import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';

const THREAD_REPLIES_PAGE_SIZE = 1000;
const THREAD_REPLIES_MAX_PAGES = 10;

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
}): Promise<SlackThreadMessage | undefined> => {
  try {
    let cursor: string | undefined;

    for (let page = 0; page < THREAD_REPLIES_MAX_PAGES; page++) {
      const replies = await client.conversations.replies({
        channel: slackChannelId,
        ts: parentMessageTimestamp,
        limit: THREAD_REPLIES_PAGE_SIZE,
        cursor,
      });

      const message = (replies.messages ?? []).find(
        (candidate) => candidate.ts === messageTimestamp,
      );

      if (isDefined(message)) {
        return { ts: message.ts, user: message.user, text: message.text };
      }

      cursor = replies.response_metadata?.next_cursor;

      if (!isNonEmptyString(cursor)) {
        return undefined;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
};
