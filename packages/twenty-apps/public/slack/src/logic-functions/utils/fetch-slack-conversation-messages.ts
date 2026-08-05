import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';

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

const toAgentMessages = ({
  messages,
  excludeMessageTimestamps,
  excludeMessageTexts,
}: {
  messages: ReadonlyArray<SlackContextMessage>;
  excludeMessageTimestamps: Set<string>;
  excludeMessageTexts: Set<string>;
}): SlackAssistantAgentMessage[] =>
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
    .map((message): SlackAssistantAgentMessage => {
      if (isNonEmptyString(message.bot_id)) {
        return { role: 'assistant', content: message.text ?? '' };
      }

      return {
        role: 'user',
        content: `<@${message.user ?? 'unknown'}>: ${message.text}`,
      };
    });

export const fetchSlackConversationMessages = async ({
  client,
  channelId,
  threadTimestamp,
  isDirectMessage,
  excludeMessageTimestamps = [],
  excludeMessageTexts = [],
}: {
  client: WebClient;
  channelId: string;
  threadTimestamp: string | undefined;
  isDirectMessage: boolean;
  excludeMessageTimestamps?: string[];
  excludeMessageTexts?: string[];
}): Promise<SlackAssistantAgentMessage[] | undefined> => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );
  const excludedTexts = new Set(excludeMessageTexts.filter(isNonEmptyString));

  try {
    if (isNonEmptyString(threadTimestamp)) {
      const replies = await client.conversations.replies({
        channel: channelId,
        ts: threadTimestamp,
        limit: THREAD_REPLIES_FETCH_LIMIT,
      });

      return toAgentMessages({
        messages: replies.messages ?? [],
        excludeMessageTimestamps: excludedTimestamps,
        excludeMessageTexts: excludedTexts,
      });
    }

    if (isDirectMessage) {
      const history = await client.conversations.history({
        channel: channelId,
        limit: CONTEXT_MESSAGE_LIMIT,
      });

      return toAgentMessages({
        messages: [...(history.messages ?? [])].reverse(),
        excludeMessageTimestamps: excludedTimestamps,
        excludeMessageTexts: excludedTexts,
      });
    }

    return undefined;
  } catch {
    return undefined;
  }
};
