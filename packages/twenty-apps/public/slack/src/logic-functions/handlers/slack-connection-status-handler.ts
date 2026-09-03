import { SLACK_CONNECTION_STATUS_TIMEOUT_MS } from 'src/logic-functions/constants/slack-connection-status-timeout-ms';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

type SlackConnectionStatusResult = {
  success: true;
  isConnected: boolean;
  installedSlackTeamId?: string;
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

    const installedSlackTeamId = await getInstalledSlackTeamId(
      slackClientResult.client,
    );

    return { success: true, isConnected: true, installedSlackTeamId };
  };
