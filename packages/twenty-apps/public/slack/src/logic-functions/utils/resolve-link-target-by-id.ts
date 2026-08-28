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

// A directly-supplied id may belong to another workspace, so resolve the
// account's real team before trusting a supplied one. With no team supplied,
// an unresolvable account fails closed rather than assume the installed
// workspace. With one, the resolved team must agree, or an admin could hand
// an in-workspace user a bogus external team and skip the consent ask. A
// Slack Connect user typically cannot be resolved here and keeps the
// supplied team.
export const resolveLinkTargetById = async ({
  slackClient,
  slackUserId,
  requestedSlackTeamId,
}: {
  slackClient: WebClient;
  slackUserId: string;
  requestedSlackTeamId: string | undefined;
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

  return { success: true, slackTeamId, identity };
};
