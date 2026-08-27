import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { buildSlackUserLinkConsentBlocks } from 'src/logic-functions/utils/build-slack-user-link-consent-blocks';

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

    await slackClient.chat.postMessage({
      channel: channelId,
      text: 'A Twenty admin asked to link your Slack account. Approve or decline it here.',
      blocks: buildSlackUserLinkConsentBlocks({
        memberName,
        slackTeamId,
        slackUserId,
        workspaceMemberId,
        slackUserLinkId,
      }),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
