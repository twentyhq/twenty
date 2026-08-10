import { SLACK_ASSISTANT_TRANSIENT_TEXTS } from 'src/logic-functions/constants/slack-assistant-transient-texts';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { fetchSlackConversationContext } from 'src/logic-functions/utils/fetch-slack-conversation-context';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

type SlackAssistantContext = {
  conversationContext: string | undefined;
  requesterName: string | undefined;
  requesterIdentity: SlackUserIdentity | undefined;
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
    return {
      conversationContext: undefined,
      requesterName: undefined,
      requesterIdentity: undefined,
    };
  }

  const { client } = slackClientResult;

  const [conversationContext, requesterIdentity] = await Promise.all([
    fetchSlackConversationContext({
      client,
      channelId: slackChannelId,
      threadTimestamp: parentMessageTimestamp,
      isDirectMessage,
      excludeMessageTimestamps,
      excludeMessageTexts: SLACK_ASSISTANT_TRANSIENT_TEXTS,
    }),
    fetchSlackUserIdentity({ client, slackUserId }),
  ]);

  return {
    conversationContext,
    requesterName: requesterIdentity?.displayName,
    requesterIdentity,
  };
};
