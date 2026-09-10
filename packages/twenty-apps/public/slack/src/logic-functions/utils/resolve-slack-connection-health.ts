import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { reportConnectionAuthFailure } from 'twenty-sdk/logic-function';
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

export type SlackConnectionHealthReport = {
  connectionHealth: SlackConnectionHealth | undefined;
  installedSlackTeamId: string | undefined;
};

type SlackAuthProbe =
  | { isAuthenticated: true; installedTeamId: string | undefined }
  | {
      isAuthenticated: false;
      isTokenRejected: boolean;
      slackErrorCode: string | undefined;
    };

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
      slackErrorCode,
    };
  }
};

// Best-effort: the platform report only mirrors what this probe already tells
// the settings tab, so a platform hiccup must not downgrade the health report.
const reportSlackTokenRejected = async ({
  connectionId,
  slackErrorCode,
}: {
  connectionId: string;
  slackErrorCode: string | undefined;
}): Promise<void> => {
  try {
    await reportConnectionAuthFailure({
      connectionId,
      reason: `Slack rejected the stored bot token (${slackErrorCode ?? 'auth error'}). Reconnect to restore the integration.`,
    });
  } catch {
    return;
  }
};

const readSlackTeamClaim = (
  installedTeamId: string,
): Promise<SlackTeamClaimLookup> =>
  findClaimedWorkspaceId(installedTeamId).then(
    (claimedWorkspaceId) => ({ isReadable: true as const, claimedWorkspaceId }),
    () => ({ isReadable: false as const }),
  );

// An undefined health means unverified, not healthy: a transient Slack or
// claim-store failure must never tell an admin to reconnect a working
// integration.
export const resolveSlackConnectionHealth = async ({
  slackClient,
  connectionId,
}: {
  slackClient: WebClient;
  connectionId: string;
}): Promise<SlackConnectionHealthReport> => {
  const authProbe = await probeSlackAuth(slackClient);

  if (!authProbe.isAuthenticated) {
    if (authProbe.isTokenRejected) {
      await reportSlackTokenRejected({
        connectionId,
        slackErrorCode: authProbe.slackErrorCode,
      });

      return {
        connectionHealth: SLACK_CONNECTION_HEALTH.TOKEN_REJECTED,
        installedSlackTeamId: undefined,
      };
    }

    return { connectionHealth: undefined, installedSlackTeamId: undefined };
  }

  const installedSlackTeamId = authProbe.installedTeamId;

  if (!isDefined(installedSlackTeamId)) {
    return { connectionHealth: undefined, installedSlackTeamId: undefined };
  }

  const [teamClaim, currentWorkspaceId] = await Promise.all([
    readSlackTeamClaim(installedSlackTeamId),
    fetchCurrentWorkspaceId(),
  ]);

  if (!teamClaim.isReadable) {
    return { connectionHealth: undefined, installedSlackTeamId };
  }

  if (!isDefined(teamClaim.claimedWorkspaceId)) {
    return {
      connectionHealth: SLACK_CONNECTION_HEALTH.TEAM_UNCLAIMED,
      installedSlackTeamId,
    };
  }

  if (!isNonEmptyString(currentWorkspaceId)) {
    return { connectionHealth: undefined, installedSlackTeamId };
  }

  return {
    connectionHealth:
      teamClaim.claimedWorkspaceId === currentWorkspaceId
        ? SLACK_CONNECTION_HEALTH.OK
        : SLACK_CONNECTION_HEALTH.TEAM_CLAIMED_BY_ANOTHER_WORKSPACE,
    installedSlackTeamId,
  };
};
