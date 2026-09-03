import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

type SlackConnectionStatusResult = {
  success: true;
  isConnected: boolean;
  installedSlackTeamId?: string;
};

export const slackConnectionStatusHandler =
  async (): Promise<SlackConnectionStatusResult> => {
    const slackClientResult = await getSlackClient();

    if (!slackClientResult.success) {
      return { success: true, isConnected: false };
    }

    const installedSlackTeamId = await getInstalledSlackTeamId(
      slackClientResult.client,
    );

    return { success: true, isConnected: true, installedSlackTeamId };
  };
