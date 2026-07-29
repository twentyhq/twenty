import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';

const SLACK_ACCOUNT_LINK_PROMPT_TEXT =
  'I can only answer Slack accounts linked to a Twenty workspace member, and yours is not linked yet. If your Slack email matches your Twenty account, message me again and I will link it automatically. Otherwise ask a workspace admin to add a Slack User Link record for you.';

export const postSlackAccountLinkPrompt = async ({
  slackChannelId,
  slackUserId,
}: {
  slackChannelId: string;
  slackUserId: string;
}): Promise<void> => {
  await slackPostEphemeralMessageHandler({
    slackChannelId,
    recipientSlackUserId: slackUserId,
    messageText: SLACK_ACCOUNT_LINK_PROMPT_TEXT,
  });
};
