import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';

type SlackConnectionStatusResult = {
  success: true;
  isConnected: boolean;
};

export const slackConnectionStatusHandler =
  async (): Promise<SlackConnectionStatusResult> => {
    const connection = await getSlackConnection();

    return { success: true, isConnected: connection.success };
  };
