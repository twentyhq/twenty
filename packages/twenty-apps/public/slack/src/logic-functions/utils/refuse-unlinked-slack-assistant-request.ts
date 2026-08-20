import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_UNLINKED_USER_TEXT } from 'src/logic-functions/constants/slack-assistant-unlinked-user-text';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';

const REFUSAL_REASON =
  'Slack account is not linked to a workspace member and the assistant is restricted to linked members';

type SlackAssistantRequestRefusalResult = {
  refused: true;
  reason: string;
};

export const refuseUnlinkedSlackAssistantRequest = async ({
  client,
  requestId,
  slackChannelId,
  slackUserId,
  parentMessageTimestamp,
}: {
  client: CoreApiClient;
  requestId: string;
  slackChannelId: string;
  slackUserId: string | undefined;
  parentMessageTimestamp: string;
}): Promise<SlackAssistantRequestRefusalResult> => {
  const ephemeralResult = isNonEmptyString(slackUserId)
    ? await slackPostEphemeralMessageHandler({
        slackChannelId,
        recipientSlackUserId: slackUserId,
        messageText: SLACK_ASSISTANT_UNLINKED_USER_TEXT,
        parentMessageTimestamp,
        messageFormat: 'markdown',
      })
    : undefined;

  // An ephemeral needs the recipient to be a member of the channel, which is not
  // guaranteed for app_mention events, so a visible reply is the only fallback.
  if (ephemeralResult?.success !== true) {
    await slackPostMessageHandler({
      slackChannelId,
      messageText: SLACK_ASSISTANT_UNLINKED_USER_TEXT,
      parentMessageTimestamp,
      messageFormat: 'markdown',
    });
  }

  await updateSlackAssistantRequest(client, {
    id: requestId,
    status: SLACK_ASSISTANT_REQUEST_STATUS.REFUSED,
    errorMessage: REFUSAL_REASON,
  });

  return { refused: true, reason: REFUSAL_REASON };
};
