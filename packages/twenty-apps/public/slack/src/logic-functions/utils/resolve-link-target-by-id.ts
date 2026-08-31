import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';

type IdLinkTarget =
  | {
      success: true;
      slackTeamId: string;
      identity: SlackUserIdentity | undefined;
    }
  | { success: false; message: string; error: string };

export const resolveLinkTargetById = async ({
  slackClient,
  slackUserId,
  requestedSlackTeamId,
  installedSlackTeamId,
}: {
  slackClient: WebClient;
  slackUserId: string;
  requestedSlackTeamId: string | undefined;
  installedSlackTeamId: string;
}): Promise<IdLinkTarget> => {
  const identity = await fetchSlackUserIdentity({
    client: slackClient,
    slackUserId,
  });

  if (
    isNonEmptyString(requestedSlackTeamId) &&
    isDefined(identity) &&
    isNonEmptyString(identity.slackTeamId) &&
    identity.slackTeamId !== requestedSlackTeamId
  ) {
    return {
      success: false,
      message: 'Slack team id does not match the user',
      error: `That Slack user belongs to workspace ${identity.slackTeamId}, not ${requestedSlackTeamId}. Check the team id and try again.`,
    };
  }

  const slackTeamId = isNonEmptyString(requestedSlackTeamId)
    ? requestedSlackTeamId
    : identity?.slackTeamId;

  if (!isNonEmptyString(slackTeamId)) {
    return {
      success: false,
      message: 'Could not resolve the Slack workspace',
      error:
        'Could not determine which Slack workspace this user belongs to. Provide their Slack team id and try again.',
    };
  }

  if (!isDefined(identity) && slackTeamId === installedSlackTeamId) {
    return {
      success: false,
      message: 'Could not verify the Slack user in your workspace',
      error:
        'Slack could not find that user id in the installed workspace. Check the id, or for a guest or Slack Connect user enter their own Slack team id.',
    };
  }

  return { success: true, slackTeamId, identity };
};
