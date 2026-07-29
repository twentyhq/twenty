import { fetchSlackConversationContext } from 'src/logic-functions/utils/fetch-slack-conversation-context';
import { fetchSlackRequesterName } from 'src/logic-functions/utils/fetch-slack-requester-name';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

type SlackAssistantContext = {
  conversationContext: string | undefined;
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
    return { conversationContext: undefined, requesterName: undefined };
  }

  const { client } = slackClientResult;

  const [conversationContext, requesterName] = await Promise.all([
    fetchSlackConversationContext({
      client,
      channelId: slackChannelId,
      threadTimestamp: parentMessageTimestamp,
      isDirectMessage,
      excludeMessageTimestamps,
    }),
    fetchSlackRequesterName({ client, slackUserId }),
  ]);

  return { conversationContext, requesterName };
};
