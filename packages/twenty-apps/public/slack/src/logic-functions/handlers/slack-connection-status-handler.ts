import { WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import {
  SLACK_CONNECTION_HEALTH,
  type SlackConnectionHealth,
} from 'src/logic-functions/constants/slack-connection-health';
import { fetchCurrentWorkspaceId } from 'src/logic-functions/utils/fetch-current-workspace-id';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/find-claimed-workspace-id';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';
import { readSlackRosterMatchOutcome } from 'src/logic-functions/utils/read-slack-roster-match-outcome';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

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
    const connection = await getSlackConnection();

    if (!connection.success) {
      return { success: true, isConnected: false };
    }

    let installedTeamId: string | undefined;

    try {
      const authResult = await new WebClient(
        connection.accessToken,
      ).auth.test();

      installedTeamId = authResult.team_id;
    } catch (error) {
      const errorMessage = toErrorMessage(error);

      if (SLACK_AUTH_ERROR_CODES.some((code) => errorMessage.includes(code))) {
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

    const [claimedWorkspaceId, currentWorkspaceId, rosterMatchOutcome] =
      await Promise.all([
        findClaimedWorkspaceId(installedTeamId),
        fetchCurrentWorkspaceId(),
        readSlackRosterMatchOutcome(),
      ]);

    if (!isDefined(claimedWorkspaceId)) {
      return {
        success: true,
        isConnected: true,
        connectionHealth: SLACK_CONNECTION_HEALTH.TEAM_UNCLAIMED,
      };
    }

    if (
      isNonEmptyString(currentWorkspaceId) &&
      claimedWorkspaceId !== currentWorkspaceId
    ) {
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
