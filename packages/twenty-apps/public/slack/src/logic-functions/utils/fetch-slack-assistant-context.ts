import { type WebClient } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_CONTEXT_REQUEST_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-context-request-timeout-ms';
import { SLACK_ASSISTANT_CONTEXT_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-context-timeout-ms';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { buildSlackConversationMessages } from 'src/logic-functions/utils/build-slack-conversation-messages';
import { collectSlackSharedFileNames } from 'src/logic-functions/utils/collect-slack-shared-file-names';
import { fetchSlackThreadMessages } from 'src/logic-functions/utils/fetch-slack-thread-messages';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { isSlackDirectMessageChannel } from 'src/logic-functions/utils/is-slack-direct-message-channel';
import { resolveSlackBotUserIdOrThrow } from 'src/logic-functions/utils/resolve-slack-bot-user-id-or-throw';
import { runWithTimeout } from 'src/logic-functions/utils/run-with-timeout';
import { selectSlackConversationMessages } from 'src/logic-functions/utils/select-slack-conversation-messages';

type SlackAssistantContext = {
  conversationMessages: SlackAssistantAgentMessage[];
  sharedFileNames: string[];
  requesterName: string | undefined;
  requesterIdentity: SlackUserIdentity | undefined;
  requestMessage: SlackThreadMessage | undefined;
  threadMessages: SlackThreadMessage[];
  slackClient: WebClient | undefined;
  assistantBotUserId: string | undefined;
  isDirectMessage: boolean;
};

const UNREACHABLE_SLACK_CONTEXT: SlackAssistantContext = {
  conversationMessages: [],
  sharedFileNames: [],
  requesterName: undefined,
  requesterIdentity: undefined,
  requestMessage: undefined,
  threadMessages: [],
  slackClient: undefined,
  assistantBotUserId: undefined,
  isDirectMessage: false,
};

const readSlackThreadContext = async ({
  client,
  slackChannelId,
  parentMessageTimestamp,
  slackMessageTimestamp,
  slackUserId,
}: {
  client: WebClient;
  slackChannelId: string;
  parentMessageTimestamp: string;
  slackMessageTimestamp: string;
  slackUserId: string | undefined;
}): Promise<SlackAssistantContext> => {
  const assistantBotUserId = await resolveSlackBotUserIdOrThrow().catch(
    (error) => {
      console.warn(
        `[slack] failed to resolve the bot user id, past assistant replies are replayed as user turns: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    },
  );

  const [{ tailMessages, requestMessage }, requesterIdentity, isDirectMessage] =
    await Promise.all([
      fetchSlackThreadMessages({
        client,
        slackChannelId,
        parentMessageTimestamp,
        requestMessageTimestamp: slackMessageTimestamp,
      }),
      fetchSlackUserIdentity({ client, slackUserId }),
      isSlackDirectMessageChannel({ client, slackChannelId }),
    ]);

  const conversationThreadMessages = selectSlackConversationMessages({
    messages: tailMessages,
    excludeMessageTimestamps: [slackMessageTimestamp],
  });

  return {
    conversationMessages: buildSlackConversationMessages({
      messages: conversationThreadMessages,
      assistantBotUserId,
    }),
    sharedFileNames: collectSlackSharedFileNames(
      [requestMessage, ...conversationThreadMessages].filter(isDefined),
    ),
    requesterName: requesterIdentity?.displayName,
    requesterIdentity,
    requestMessage,
    threadMessages: tailMessages,
    slackClient: client,
    assistantBotUserId,
    isDirectMessage,
  };
};

export const fetchSlackAssistantContext = async ({
  slackChannelId,
  parentMessageTimestamp,
  slackMessageTimestamp,
  slackUserId,
}: {
  slackChannelId: string;
  parentMessageTimestamp: string;
  slackMessageTimestamp: string;
  slackUserId: string | undefined;
}): Promise<SlackAssistantContext> => {
  // the agent budget is already ticking: partial context beats a late answer
  const contextDeadlineAtMs = Date.now() + SLACK_ASSISTANT_CONTEXT_TIMEOUT_MS;

  const slackClientResult = await runWithTimeout({
    operation: getSlackClient({
      timeout: SLACK_ASSISTANT_CONTEXT_REQUEST_TIMEOUT_MS,
    }),
    timeoutMs: SLACK_ASSISTANT_CONTEXT_TIMEOUT_MS,
    buildTimeoutValue: () => {
      console.warn(
        `[slack] acquiring the Slack client exceeded ${SLACK_ASSISTANT_CONTEXT_TIMEOUT_MS}ms, answering without thread history`,
      );

      return {
        success: false as const,
        error: 'Timed out acquiring the Slack client',
      };
    },
  });

  if (!slackClientResult.success) {
    return UNREACHABLE_SLACK_CONTEXT;
  }

  const { client } = slackClientResult;

  return await runWithTimeout({
    operation: readSlackThreadContext({
      client,
      slackChannelId,
      parentMessageTimestamp,
      slackMessageTimestamp,
      slackUserId,
    }),
    timeoutMs: Math.max(contextDeadlineAtMs - Date.now(), 0),
    buildTimeoutValue: () => {
      console.warn(
        `[slack] assistant context read exceeded ${SLACK_ASSISTANT_CONTEXT_TIMEOUT_MS}ms, answering without thread history`,
      );

      return { ...UNREACHABLE_SLACK_CONTEXT, slackClient: client };
    },
  });
};
