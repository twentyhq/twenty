import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { buildSlackUserLinkConsentBlocks } from 'src/logic-functions/utils/build-slack-user-link-consent-blocks';
import { enqueueSlackMessageDelivery } from 'src/logic-functions/utils/enqueue-slack-message-delivery';
import { postSlackMessage } from 'src/logic-functions/utils/post-slack-message';
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
): Promise<{ success: boolean; error?: string }> => {
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

    const consentMessage: SlackPostMessageInput = {
      slackChannelId: channelId,
      messageText:
        'A Twenty admin asked to link your Slack account. Approve or decline it here.',
      messageBlocks: buildSlackUserLinkConsentBlocks({
        memberName,
        slackTeamId,
        slackUserId,
        workspaceMemberId,
        slackUserLinkId,
      }),
    };

    const deliveryResult = await postSlackMessage(slackClient, consentMessage, {
      waitOutRateLimit: false,
    });

    if (deliveryResult.success) {
      return { success: true };
    }

    if (isDefined(deliveryResult.retryAfterSeconds)) {
      await enqueueSlackMessageDelivery({
        payload: consentMessage,
        retryAfterSeconds: deliveryResult.retryAfterSeconds,
      });

      return { success: true };
    }

    return {
      success: false,
      error: deliveryResult.error ?? deliveryResult.message,
    };
  } catch (error) {
    return {
      success: false,
      error: toErrorMessage(error),
    };
  }
};
