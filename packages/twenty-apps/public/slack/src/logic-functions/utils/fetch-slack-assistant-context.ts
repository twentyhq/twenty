import { SLACK_ASSISTANT_TRANSIENT_TEXTS } from 'src/logic-functions/constants/slack-assistant-transient-texts';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { fetchSlackConversationMessages } from 'src/logic-functions/utils/fetch-slack-conversation-messages';
import { fetchSlackRequesterName } from 'src/logic-functions/utils/fetch-slack-requester-name';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { resolveSlackBotUserIdOrThrow } from 'src/logic-functions/utils/resolve-slack-bot-user-id-or-throw';

type SlackAssistantContext = {
  conversationMessages: SlackAssistantAgentMessage[];
  requesterName: string | undefined;
};

export const fetchSlackAssistantContext = async ({
  slackChannelId,
  parentMessageTimestamp,
  isDirectMessage,
  slackUserId,
  excludeMessageTimestamps,
}: {
  slackChannelId: string;
  parentMessageTimestamp: string | undefined;
  isDirectMessage: boolean;
  slackUserId: string | undefined;
  excludeMessageTimestamps: string[];
}): Promise<SlackAssistantContext> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return { conversationMessages: [], requesterName: undefined };
  }

  const { client } = slackClientResult;

  const assistantBotUserId = await resolveSlackBotUserIdOrThrow().catch(
    () => undefined,
  );

  const [conversationMessages, requesterName] = await Promise.all([
    fetchSlackConversationMessages({
      client,
      channelId: slackChannelId,
      threadTimestamp: parentMessageTimestamp,
      isDirectMessage,
      assistantBotUserId,
      excludeMessageTimestamps,
      excludeMessageTexts: SLACK_ASSISTANT_TRANSIENT_TEXTS,
    }),
    fetchSlackRequesterName({ client, slackUserId }),
  ]);

  return { conversationMessages, requesterName };
};
