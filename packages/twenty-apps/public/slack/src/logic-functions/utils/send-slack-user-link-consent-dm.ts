import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { buildSlackUserLinkConsentBlocks } from 'src/logic-functions/utils/build-slack-user-link-consent-blocks';
import { enqueueSlackMessageDelivery } from 'src/logic-functions/utils/enqueue-slack-message-delivery';
import { isSlackRateLimitedError } from 'src/logic-functions/utils/is-slack-rate-limited-error';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const sendSlackUserLinkConsentDm = async (
  slackClient: WebClient,
  {
    slackTeamId,
    slackUserId,
    workspaceMemberId,
    slackUserLinkId,
    memberName,
  }: {
    slackTeamId: string;
    slackUserId: string;
    workspaceMemberId: string;
    slackUserLinkId: string;
    memberName: string | undefined;
  },
): Promise<{ success: boolean; error?: string; deferred?: boolean }> => {
  try {
    const conversation = await slackClient.conversations.open({
      users: slackUserId,
    });

    const channelId = conversation.channel?.id;

    if (!isNonEmptyString(channelId)) {
      return {
        success: false,
        error: 'Slack did not open a direct message with that user.',
      };
    }

    const messageText =
      'A Twenty admin asked to link your Slack account. Approve or decline it here.';

    const messageBlocks = buildSlackUserLinkConsentBlocks({
      memberName,
      slackTeamId,
      slackUserId,
      workspaceMemberId,
      slackUserLinkId,
    });

    try {
      await slackClient.chat.postMessage({
        channel: channelId,
        text: messageText,
        blocks: messageBlocks,
      });
    } catch (error) {
      if (!isSlackRateLimitedError(error)) {
        throw error;
      }

      await enqueueSlackMessageDelivery({
        payload: {
          slackChannelId: channelId,
          messageText,
          messageBlocks,
        },
        retryAfterSeconds: error.retryAfter,
      });

      return { success: true, deferred: true };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: toErrorMessage(error),
    };
  }
};
