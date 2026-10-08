import { type WebClient } from '@slack/web-api';

import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

const BEST_EFFORT_TIMEOUT_MS = 5000;

export const resolveBestEffortSlackClient = async (
  description: string,
): Promise<WebClient | undefined> => {
  const slackClientResult = await getSlackClient({
    retryConfig: { retries: 0 },
    timeout: BEST_EFFORT_TIMEOUT_MS,
  });

  if (!slackClientResult.success) {
    console.warn(`[slack] ${description} skipped: ${slackClientResult.error}`);

    return undefined;
  }

  return slackClientResult.client;
};
