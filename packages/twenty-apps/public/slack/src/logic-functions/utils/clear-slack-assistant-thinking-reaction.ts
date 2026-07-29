import { SLACK_ASSISTANT_THINKING_REACTION_EMOJI } from 'src/logic-functions/constants/slack-assistant-thinking-reaction-emoji';
import { runSlackReaction } from 'src/logic-functions/utils/run-slack-reaction';

export const clearSlackAssistantThinkingReaction = async ({
  slackChannelId,
  slackMessageTimestamp,
}: {
  slackChannelId: string;
  slackMessageTimestamp: string;
}): Promise<void> => {
  await runSlackReaction({
    operation: 'remove',
    slackChannelId,
    messageTimestamp: slackMessageTimestamp,
    emojiName: SLACK_ASSISTANT_THINKING_REACTION_EMOJI,
  });
};
