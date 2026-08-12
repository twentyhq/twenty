import { type WebClient } from '@slack/web-api';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { buildSlackConversationMessages } from 'src/logic-functions/utils/build-slack-conversation-messages';
import { fetchSlackThreadMessages } from 'src/logic-functions/utils/fetch-slack-thread-messages';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { resolveSlackBotUserIdOrThrow } from 'src/logic-functions/utils/resolve-slack-bot-user-id-or-throw';

type SlackAssistantContext = {
  conversationMessages: SlackAssistantAgentMessage[];
  requesterName: string | undefined;
  requesterIdentity: SlackUserIdentity | undefined;
  requestMessage: SlackThreadMessage | undefined;
  slackClient: WebClient | undefined;
  assistantBotUserId: string | undefined;
};

const UNREACHABLE_SLACK_CONTEXT: SlackAssistantContext = {
  conversationMessages: [],
  requesterName: undefined,
  requesterIdentity: undefined,
  requestMessage: undefined,
  slackClient: undefined,
  assistantBotUserId: undefined,
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
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return UNREACHABLE_SLACK_CONTEXT;
  }

  const { client } = slackClientResult;

  const assistantBotUserId = await resolveSlackBotUserIdOrThrow().catch(
    (error) => {
      console.warn(
        `[slack] failed to resolve the bot user id, past assistant replies are replayed as user turns: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    },
  );

  const [{ tailMessages, requestMessage }, requesterIdentity] =
    await Promise.all([
      fetchSlackThreadMessages({
        client,
        slackChannelId,
        parentMessageTimestamp,
        requestMessageTimestamp: slackMessageTimestamp,
      }),
      fetchSlackUserIdentity({ client, slackUserId }),
    ]);

  return {
    conversationMessages: buildSlackConversationMessages({
      messages: tailMessages,
      assistantBotUserId,
      excludeMessageTimestamps: [slackMessageTimestamp],
    }),
    requesterName: requesterIdentity?.displayName,
    requesterIdentity,
    requestMessage,
    slackClient: client,
    assistantBotUserId,
  };
};
