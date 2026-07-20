import { type WebClient } from '@slack/web-api';

import { isNonEmptyString } from '@sniptt/guards';

const CONTEXT_MESSAGE_LIMIT = 15;

type SlackContextMessage = {
  user?: string;
  bot_id?: string;
  text?: string;
};

const formatContextMessages = (messages: SlackContextMessage[]): string =>
  messages
    .filter((message) => isNonEmptyString(message.text))
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
}: {
  client: WebClient;
  channelId: string;
  threadTimestamp: string;
  isDirectMessage: boolean;
}): Promise<string | undefined> => {
  try {
    if (isNonEmptyString(threadTimestamp)) {
      const replies = await client.conversations.replies({
        channel: channelId,
        ts: threadTimestamp,
        limit: CONTEXT_MESSAGE_LIMIT,
      });

      return formatContextMessages(
        (replies.messages ?? []) as SlackContextMessage[],
      );
    }

    if (isDirectMessage) {
      const history = await client.conversations.history({
        channel: channelId,
        limit: CONTEXT_MESSAGE_LIMIT,
      });

      return formatContextMessages(
        ((history.messages ?? []) as SlackContextMessage[]).reverse(),
      );
    }

    return undefined;
  } catch {
    return undefined;
  }
};
