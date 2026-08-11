import { isDefined } from 'twenty-sdk/utils';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { fetchSlackThreadMessages } from 'src/logic-functions/utils/fetch-slack-thread-messages';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { formatSlackConversationContext } from 'src/logic-functions/utils/format-slack-conversation-context';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

type SlackAssistantContext = {
  conversationContext: string | undefined;
  requesterName: string | undefined;
  requesterIdentity: SlackUserIdentity | undefined;
  requestMessage: SlackThreadMessage | undefined;
};

const UNREACHABLE_SLACK_CONTEXT: SlackAssistantContext = {
  conversationContext: undefined,
  requesterName: undefined,
  requesterIdentity: undefined,
  requestMessage: undefined,
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

  const [threadMessages, requesterIdentity] = await Promise.all([
    fetchSlackThreadMessages({
      client,
      slackChannelId,
      parentMessageTimestamp,
    }),
    fetchSlackUserIdentity({ client, slackUserId }),
  ]);

  return {
    conversationContext: isDefined(threadMessages)
      ? formatSlackConversationContext({
          messages: threadMessages,
          excludeMessageTimestamps: [slackMessageTimestamp],
        })
      : undefined,
    requesterName: requesterIdentity?.displayName,
    requesterIdentity,
    requestMessage: threadMessages?.find(
      (message) => message.ts === slackMessageTimestamp,
    ),
  };
};
