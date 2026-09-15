import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveLinkTargetByEmail } from 'src/logic-functions/utils/resolve-link-target-by-email';
import { resolveLinkTargetById } from 'src/logic-functions/utils/resolve-link-target-by-id';

type SlackUserLinkTarget =
  | {
      success: true;
      slackUserId: string;
      slackTeamId: string;
      name: string | undefined;
      identity: SlackUserIdentity | undefined;
    }
  | { success: false; message: string; error: string };

export const resolveSlackUserLinkTarget = async ({
  slackClient,
  requestedSlackUserId,
  email,
  requestedSlackTeamId,
  requestedName,
  installedSlackTeamId,
}: {
  slackClient: WebClient;
  requestedSlackUserId: string | undefined;
  email: string | undefined;
  requestedSlackTeamId: string | undefined;
  requestedName: string | undefined;
  installedSlackTeamId: string;
}): Promise<SlackUserLinkTarget> => {
  // A Slack user id is the more specific of the two, so it wins when both are given.
  if (isNonEmptyString(requestedSlackUserId)) {
    const idTarget = await resolveLinkTargetById({
      slackClient,
      slackUserId: requestedSlackUserId,
      requestedSlackTeamId,
      installedSlackTeamId,
    });

    if (!idTarget.success) {
      return idTarget;
    }

    return {
      success: true,
      slackUserId: requestedSlackUserId,
      slackTeamId: idTarget.slackTeamId,
      name: requestedName ?? idTarget.identity?.displayName,
      identity: idTarget.identity,
    };
  }

  if (!isNonEmptyString(email)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'Provide a Slack email or a Slack user id.',
    };
  }

  const emailTarget = await resolveLinkTargetByEmail({
    slackClient,
    email,
    requestedSlackTeamId,
    installedSlackTeamId,
  });

  if (!emailTarget.success) {
    return emailTarget;
  }

  return {
    success: true,
    slackUserId: emailTarget.slackUserId,
    slackTeamId: emailTarget.slackTeamId ?? installedSlackTeamId,
    name: requestedName ?? emailTarget.displayName,
    identity: undefined,
  };
};
