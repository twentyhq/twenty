import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

type SlackReactionOperation = 'add' | 'remove';

type RunSlackReactionArgs = {
  operation: SlackReactionOperation;
  slackChannelId: string;
  messageTimestamp: string;
  emojiName: string;
};

export const runSlackReaction = async ({
  operation,
  slackChannelId,
  messageTimestamp,
  emojiName,
}: RunSlackReactionArgs): Promise<SlackToolResult> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  const trimmedEmojiName = emojiName.trim();
  const { client } = slackClientResult;

  try {
    await client.reactions[operation]({
      channel: slackChannelId,
      timestamp: messageTimestamp,
      name: trimmedEmojiName,
    });

    const actionLabel = operation === 'add' ? 'added to' : 'removed from';

    return {
      success: true,
      message: `Reaction "${trimmedEmojiName}" ${actionLabel} the message.`,
      slackTs: messageTimestamp,
      channel: slackChannelId,
    };
  } catch (error) {
    return slackToolFailure(`Failed to ${operation} Slack reaction`, error);
  }
};
