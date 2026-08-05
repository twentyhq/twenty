import { SLACK_ASSISTANT_TRANSIENT_TEXTS } from 'src/logic-functions/constants/slack-assistant-transient-texts';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { fetchSlackAssistantBotId } from 'src/logic-functions/utils/fetch-slack-assistant-bot-id';
import { fetchSlackConversationMessages } from 'src/logic-functions/utils/fetch-slack-conversation-messages';
import { fetchSlackRequesterName } from 'src/logic-functions/utils/fetch-slack-requester-name';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

type SlackAssistantContext = {
  conversationMessages: SlackAssistantAgentMessage[] | undefined;
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
    return { conversationMessages: undefined, requesterName: undefined };
  }

  const { client } = slackClientResult;

  const [conversationMessages, requesterName] = await Promise.all([
    fetchSlackAssistantBotId(client).then((assistantBotId) =>
      fetchSlackConversationMessages({
        client,
        channelId: slackChannelId,
        threadTimestamp: parentMessageTimestamp,
        isDirectMessage,
        assistantBotId,
        excludeMessageTimestamps,
        excludeMessageTexts: SLACK_ASSISTANT_TRANSIENT_TEXTS,
      }),
    ),
    fetchSlackRequesterName({ client, slackUserId }),
  ]);

  return { conversationMessages, requesterName };
};
