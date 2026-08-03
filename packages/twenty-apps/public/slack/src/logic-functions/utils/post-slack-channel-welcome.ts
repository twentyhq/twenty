import { isNonEmptyString } from '@sniptt/guards';

import {
  SLACK_CHANNEL_WELCOME_TEXT,
  SLACK_CHANNEL_WELCOME_THREAD_TEXT,
} from 'src/logic-functions/constants/slack-channel-welcome-text';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { claimSlackChannelWelcome } from 'src/logic-functions/utils/claim-slack-channel-welcome';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { parseSlackChannelWelcomeEvent } from 'src/logic-functions/utils/parse-slack-channel-welcome-event';

type SlackChannelWelcomeResult = { ok: boolean; skipped?: string };

export const postSlackChannelWelcome = async (
  body: SlackEventsRequestBody,
): Promise<SlackChannelWelcomeResult> => {
  const parsed = parseSlackChannelWelcomeEvent(body);

  if (parsed.join === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  const { slackChannelId, slackUserId } = parsed.join;

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return { ok: false, skipped: slackClientResult.error };
  }

  const authResult = await slackClientResult.client.auth.test();

  if (authResult.user_id !== slackUserId) {
    return { ok: true, skipped: 'Someone other than the bot joined' };
  }

  const isFirstWelcome = await claimSlackChannelWelcome(slackChannelId);

  if (!isFirstWelcome) {
    return { ok: true, skipped: 'Channel was already welcomed' };
  }

  const postResult = await slackPostMessageHandler({
    slackChannelId,
    messageText: SLACK_CHANNEL_WELCOME_TEXT,
    messageFormat: 'markdown',
  });

  if (!postResult.success) {
    return { ok: false, skipped: postResult.error ?? postResult.message };
  }

  if (isNonEmptyString(postResult.slackTs)) {
    await slackPostMessageHandler({
      slackChannelId,
      messageText: SLACK_CHANNEL_WELCOME_THREAD_TEXT,
      parentMessageTimestamp: postResult.slackTs,
      messageFormat: 'markdown',
    });
  }

  return { ok: true };
};
