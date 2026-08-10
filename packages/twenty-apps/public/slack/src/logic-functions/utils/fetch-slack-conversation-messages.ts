import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { stripSlackAssistantAnswerFooter } from 'src/logic-functions/utils/strip-slack-assistant-answer-footer';

const CONTEXT_MESSAGE_LIMIT = 15;
// conversations.replies only pages forward from the start of the thread, so
// walk to the last page and keep a wide tail to stay on the most recent turns
const THREAD_REPLIES_PAGE_SIZE = 1000;
const THREAD_REPLIES_MAX_PAGES = 10;
const THREAD_REPLIES_TAIL_SIZE = 100;

type SlackContextMessage = {
  ts?: string;
  user?: string;
  bot_id?: string;
  text?: string;
};

type SlackContextMessageWithText = SlackContextMessage & { text: string };

const fetchThreadTailMessages = async ({
  client,
  channelId,
  threadTimestamp,
}: {
  client: WebClient;
  channelId: string;
  threadTimestamp: string;
}): Promise<SlackContextMessage[]> => {
  let tailMessages: SlackContextMessage[] = [];
  let cursor: string | undefined = undefined;

  for (let page = 0; page < THREAD_REPLIES_MAX_PAGES; page++) {
    const replies = await client.conversations.replies({
      channel: channelId,
      ts: threadTimestamp,
      limit: THREAD_REPLIES_PAGE_SIZE,
      cursor,
    });

    tailMessages = [...tailMessages, ...(replies.messages ?? [])].slice(
      -THREAD_REPLIES_TAIL_SIZE,
    );

    cursor = replies.response_metadata?.next_cursor;

    if (!isNonEmptyString(cursor)) {
      return tailMessages;
    }
  }

  // the tail is out of reach, and replaying the head of the thread as if it
  // were recent would mislead the agent more than having no history at all
  console.warn(
    `[slack] thread ${threadTimestamp} is longer than ${THREAD_REPLIES_MAX_PAGES * THREAD_REPLIES_PAGE_SIZE} replies, skipping history`,
  );

  return [];
};

const mapSlackMessagesToAgentMessages = ({
  messages,
  assistantBotUserId,
  excludeMessageTimestamps,
  excludeMessageTexts,
}: {
  messages: ReadonlyArray<SlackContextMessage>;
  assistantBotUserId: string | undefined;
  excludeMessageTimestamps: Set<string>;
  excludeMessageTexts: Set<string>;
}): SlackAssistantAgentMessage[] => {
  const agentMessages = messages
    .filter((message): message is SlackContextMessageWithText => {
      if (!isNonEmptyString(message.text)) {
        return false;
      }

      if (
        isNonEmptyString(message.ts) &&
        excludeMessageTimestamps.has(message.ts)
      ) {
        return false;
      }

      return !excludeMessageTexts.has(message.text);
    })
    .slice(-CONTEXT_MESSAGE_LIMIT)
    .map((message): SlackAssistantAgentMessage => {
      if (
        isNonEmptyString(message.user) &&
        message.user === assistantBotUserId
      ) {
        return {
          role: 'assistant',
          content: stripSlackAssistantAnswerFooter(message.text),
        };
      }

      const author = isNonEmptyString(message.bot_id)
        ? `bot ${message.bot_id}`
        : `<@${message.user ?? 'unknown'}>`;

      return { role: 'user', content: `${author}: ${message.text}` };
    });

  // trimming the window can leave an assistant turn first, which providers
  // reject: a conversation has to open on a user turn
  const firstUserTurnIndex = agentMessages.findIndex(
    (message) => message.role === 'user',
  );

  return firstUserTurnIndex === -1
    ? []
    : agentMessages.slice(firstUserTurnIndex);
};

export const fetchSlackConversationMessages = async ({
  client,
  channelId,
  threadTimestamp,
  isDirectMessage,
  assistantBotUserId,
  excludeMessageTimestamps = [],
  excludeMessageTexts = [],
}: {
  client: WebClient;
  channelId: string;
  threadTimestamp: string | undefined;
  isDirectMessage: boolean;
  assistantBotUserId: string | undefined;
  excludeMessageTimestamps?: string[];
  excludeMessageTexts?: string[];
}): Promise<SlackAssistantAgentMessage[]> => {
  const excludedTimestamps = new Set(
    excludeMessageTimestamps.filter(isNonEmptyString),
  );
  const excludedTexts = new Set(excludeMessageTexts.filter(isNonEmptyString));

  try {
    if (isNonEmptyString(threadTimestamp)) {
      return mapSlackMessagesToAgentMessages({
        messages: await fetchThreadTailMessages({
          client,
          channelId,
          threadTimestamp,
        }),
        assistantBotUserId,
        excludeMessageTimestamps: excludedTimestamps,
        excludeMessageTexts: excludedTexts,
      });
    }

    if (isDirectMessage) {
      const history = await client.conversations.history({
        channel: channelId,
        limit: CONTEXT_MESSAGE_LIMIT,
      });

      return mapSlackMessagesToAgentMessages({
        messages: [...(history.messages ?? [])].reverse(),
        assistantBotUserId,
        excludeMessageTimestamps: excludedTimestamps,
        excludeMessageTexts: excludedTexts,
      });
    }

    return [];
  } catch {
    return [];
  }
};
