import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_AUTH_ERROR_CODES } from 'src/logic-functions/constants/slack-auth-error-codes';
import {
  SLACK_CONNECTION_HEALTH,
  type SlackConnectionHealth,
} from 'src/logic-functions/constants/slack-connection-health';
import { fetchCurrentWorkspaceId } from 'src/logic-functions/utils/fetch-current-workspace-id';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/find-claimed-workspace-id';
import { getSlackApiErrorCode } from 'src/logic-functions/utils/get-slack-api-error-code';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

type SlackAuthProbe =
  | { isAuthenticated: true; installedTeamId: string | undefined }
  | { isAuthenticated: false; isTokenRejected: boolean };

type SlackTeamClaimLookup =
  | { isReadable: true; claimedWorkspaceId: string | null }
  | { isReadable: false };

const probeSlackAuth = async (
  slackClient: WebClient,
): Promise<SlackAuthProbe> => {
  try {
    const authResult = await slackClient.auth.test();

    return {
      isAuthenticated: true,
      installedTeamId: readOptionalString(authResult.team_id),
    };
  } catch (error) {
    const slackErrorCode = getSlackApiErrorCode(error);

    return {
      isAuthenticated: false,
      isTokenRejected:
        isNonEmptyString(slackErrorCode) &&
        SLACK_AUTH_ERROR_CODES.includes(slackErrorCode),
    };
  }
};

const readSlackTeamClaim = (
  installedTeamId: string,
): Promise<SlackTeamClaimLookup> =>
  findClaimedWorkspaceId(installedTeamId).then(
    (claimedWorkspaceId) => ({ isReadable: true as const, claimedWorkspaceId }),
    () => ({ isReadable: false as const }),
  );

// Undefined means unverified, not healthy: a transient Slack or claim-store
// failure must never tell an admin to reconnect a working integration.
export const resolveSlackConnectionHealth = async (
  slackClient: WebClient,
): Promise<SlackConnectionHealth | undefined> => {
  const authProbe = await probeSlackAuth(slackClient);

  if (!authProbe.isAuthenticated) {
    return authProbe.isTokenRejected
      ? SLACK_CONNECTION_HEALTH.TOKEN_REJECTED
      : undefined;
  }

  if (!isDefined(authProbe.installedTeamId)) {
    return undefined;
  }

  const [teamClaim, currentWorkspaceId] = await Promise.all([
    readSlackTeamClaim(authProbe.installedTeamId),
    fetchCurrentWorkspaceId(),
  ]);

  if (!teamClaim.isReadable) {
    return undefined;
  }

  if (!isDefined(teamClaim.claimedWorkspaceId)) {
    return SLACK_CONNECTION_HEALTH.TEAM_UNCLAIMED;
  }

  if (!isNonEmptyString(currentWorkspaceId)) {
    return undefined;
  }

  return teamClaim.claimedWorkspaceId === currentWorkspaceId
    ? SLACK_CONNECTION_HEALTH.OK
    : SLACK_CONNECTION_HEALTH.TEAM_CLAIMED_BY_ANOTHER_WORKSPACE;
};
