import { type WebClient } from '@slack/web-api';

import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

export const runBestEffortSlackCall = async (
  call: (client: WebClient) => Promise<unknown>,
): Promise<void> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return;
  }

  try {
    await call(slackClientResult.client);
  } catch {
    return;
  }
};
