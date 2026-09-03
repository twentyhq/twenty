import { type SlackConnectionHealth } from 'src/logic-functions/constants/slack-connection-health';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { readSlackRosterMatchRunOutcome } from 'src/logic-functions/utils/read-slack-roster-match-run-outcome';
import { resolveSlackConnectionHealth } from 'src/logic-functions/utils/resolve-slack-connection-health';

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

    const [connectionHealth, rosterMatchRunOutcome] = await Promise.all([
      resolveSlackConnectionHealth(slackClientResult.client),
      readSlackRosterMatchRunOutcome(),
    ]);

    return {
      success: true,
      isConnected: true,
      connectionHealth,
      hasRosterMatchFailed: rosterMatchRunOutcome?.isSuccessful === false,
    };
  };
