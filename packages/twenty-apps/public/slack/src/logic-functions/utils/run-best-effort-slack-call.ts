import { type WebClient } from '@slack/web-api';

import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

export const runBestEffortSlackCall = async (
  description: string,
  call: (client: WebClient) => Promise<unknown>,
): Promise<void> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    console.warn(`[slack] ${description} skipped: ${slackClientResult.error}`);

    return;
  }

  try {
    await call(slackClientResult.client);
  } catch (error) {
    console.warn(
      `[slack] ${description} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
