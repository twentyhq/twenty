import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import {
  SLACK_CONNECTION_HEALTH,
  type SlackConnectionHealth,
} from 'src/logic-functions/constants/slack-connection-health';
import { fetchCurrentWorkspaceId } from 'src/logic-functions/utils/fetch-current-workspace-id';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/find-claimed-workspace-id';
import { getSlackApiErrorCode } from 'src/logic-functions/utils/get-slack-api-error-code';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { readSlackRosterMatchOutcome } from 'src/logic-functions/utils/read-slack-roster-match-outcome';

const SLACK_AUTH_ERROR_CODES = [
  'invalid_auth',
  'not_authed',
  'account_inactive',
  'token_revoked',
  'token_expired',
];

type SlackConnectionStatusResult = {
  success: true;
  isConnected: boolean;
  connectionHealth?: SlackConnectionHealth;
  hasRosterMatchFailed?: boolean;
};

export const slackConnectionStatusHandler =
  async (): Promise<SlackConnectionStatusResult> => {
    const slackClientResult = await getSlackClient();

    if (!slackClientResult.success) {
      return { success: true, isConnected: false };
    }

    let installedTeamId: string | undefined;

    try {
      const authResult = await slackClientResult.client.auth.test();

      installedTeamId = authResult.team_id;
    } catch (error) {
      const slackErrorCode = getSlackApiErrorCode(error);

      if (
        isNonEmptyString(slackErrorCode) &&
        SLACK_AUTH_ERROR_CODES.includes(slackErrorCode)
      ) {
        return {
          success: true,
          isConnected: true,
          connectionHealth: SLACK_CONNECTION_HEALTH.TOKEN_REJECTED,
        };
      }

      return { success: true, isConnected: true };
    }

    if (!isNonEmptyString(installedTeamId)) {
      return { success: true, isConnected: true };
    }

    const [claimLookup, currentWorkspaceId, rosterMatchOutcome] =
      await Promise.all([
        findClaimedWorkspaceId(installedTeamId).then(
          (claimedWorkspaceId) => ({
            hasFailed: false as const,
            claimedWorkspaceId,
          }),
          () => ({ hasFailed: true as const }),
        ),
        fetchCurrentWorkspaceId(),
        readSlackRosterMatchOutcome(),
      ]);

    if (claimLookup.hasFailed) {
      return { success: true, isConnected: true };
    }

    const { claimedWorkspaceId } = claimLookup;

    if (!isDefined(claimedWorkspaceId)) {
      return {
        success: true,
        isConnected: true,
        connectionHealth: SLACK_CONNECTION_HEALTH.TEAM_UNCLAIMED,
      };
    }

    if (!isNonEmptyString(currentWorkspaceId)) {
      return {
        success: true,
        isConnected: true,
        hasRosterMatchFailed: rosterMatchOutcome?.isSuccessful === false,
      };
    }

    if (claimedWorkspaceId !== currentWorkspaceId) {
      return {
        success: true,
        isConnected: true,
        connectionHealth:
          SLACK_CONNECTION_HEALTH.TEAM_CLAIMED_BY_ANOTHER_WORKSPACE,
      };
    }

    return {
      success: true,
      isConnected: true,
      connectionHealth: SLACK_CONNECTION_HEALTH.OK,
      hasRosterMatchFailed: rosterMatchOutcome?.isSuccessful === false,
    };
  };
