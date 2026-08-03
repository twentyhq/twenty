import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_CHANNEL_WELCOME_THREAD_TEXT } from 'src/logic-functions/constants/slack-channel-welcome-thread-text';
import { SLACK_CHANNEL_WELCOME_TEXT } from 'src/logic-functions/constants/slack-channel-welcome-text';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { claimSlackChannelWelcome } from 'src/logic-functions/utils/claim-slack-channel-welcome';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { parseSlackChannelWelcomeEvent } from 'src/logic-functions/utils/parse-slack-channel-welcome-event';
import { releaseSlackChannelWelcome } from 'src/logic-functions/utils/release-slack-channel-welcome';

type SlackChannelWelcomeResult = { ok: boolean; skipped?: string };

export const postSlackChannelWelcome = async (
  body: SlackEventsRequestBody,
): Promise<SlackChannelWelcomeResult> => {
  const parsed = parseSlackChannelWelcomeEvent(body);

  if (parsed.channelJoin === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  const { slackChannelId, slackUserId } = parsed.channelJoin;

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    throw new Error(slackClientResult.error);
  }

  const authResult = await slackClientResult.client.auth.test();

  if (authResult.user_id !== slackUserId) {
    return { ok: true, skipped: 'Someone other than the bot joined' };
  }

  const isFirstWelcome = await claimSlackChannelWelcome(slackChannelId);

  if (!isFirstWelcome) {
    return { ok: true, skipped: 'Channel was already welcomed' };
  }

  const channelMessageResult = await slackPostMessageHandler({
    slackChannelId,
    messageText: SLACK_CHANNEL_WELCOME_TEXT,
    messageFormat: 'markdown',
  });

  if (
    !channelMessageResult.success ||
    !isNonEmptyString(channelMessageResult.slackTs)
  ) {
    await releaseSlackChannelWelcome(slackChannelId);

    throw new Error(
      `Failed to post the Slack welcome in channel ${slackChannelId}: ${channelMessageResult.error ?? channelMessageResult.message}`,
    );
  }

  const threadMessageResult = await slackPostMessageHandler({
    slackChannelId,
    messageText: SLACK_CHANNEL_WELCOME_THREAD_TEXT,
    parentMessageTimestamp: channelMessageResult.slackTs,
    messageFormat: 'markdown',
  });

  // The channel message is already out, so the claim is kept on purpose: a retry must not post it twice.
  if (!threadMessageResult.success) {
    throw new Error(
      `Failed to post the Slack welcome thread reply in channel ${slackChannelId}: ${threadMessageResult.error ?? threadMessageResult.message}`,
    );
  }

  return { ok: true };
};
