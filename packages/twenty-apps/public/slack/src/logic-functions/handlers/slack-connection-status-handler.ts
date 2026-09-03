import { type SlackConnectionHealth } from 'src/logic-functions/constants/slack-connection-health';
import { SLACK_CONNECTION_STATUS_TIMEOUT_MS } from 'src/logic-functions/constants/slack-connection-status-timeout-ms';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { readSlackRosterMatchRunOutcome } from 'src/logic-functions/utils/read-slack-roster-match-run-outcome';
import { resolveSlackConnectionHealth } from 'src/logic-functions/utils/resolve-slack-connection-health';

type SlackConnectionStatusResult = {
  success: true;
  isConnected: boolean;
  installedSlackTeamId?: string;
  connectionHealth?: SlackConnectionHealth;
  hasRosterMatchFailed?: boolean;
};

export const slackConnectionStatusHandler =
  async (): Promise<SlackConnectionStatusResult> => {
    const slackClientResult = await getSlackClient({
      timeout: SLACK_CONNECTION_STATUS_TIMEOUT_MS,
      retryConfig: { retries: 0 },
    });

    if (!slackClientResult.success) {
      return { success: true, isConnected: false };
    }

    const [connectionHealthReport, rosterMatchRunOutcome] = await Promise.all([
      resolveSlackConnectionHealth(slackClientResult.client),
      readSlackRosterMatchRunOutcome(),
    ]);

    return {
      success: true,
      isConnected: true,
      installedSlackTeamId: connectionHealthReport.installedSlackTeamId,
      connectionHealth: connectionHealthReport.connectionHealth,
      hasRosterMatchFailed: rosterMatchRunOutcome?.isSuccessful === false,
    };
  };
