import { type WebClient } from '@slack/web-api';

import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

const BEST_EFFORT_TIMEOUT_MS = 5000;

export const runBestEffortSlackCall = async (
  description: string,
  call: (client: WebClient) => Promise<unknown>,
): Promise<void> => {
  const slackClientResult = await getSlackClient({
    retryConfig: { retries: 0 },
    timeout: BEST_EFFORT_TIMEOUT_MS,
  });

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
