import { type WebClient } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { resolveBestEffortSlackClient } from 'src/logic-functions/utils/resolve-best-effort-slack-client';
import { runBestEffortSlackCallWithClient } from 'src/logic-functions/utils/run-best-effort-slack-call-with-client';

export const runBestEffortSlackCall = async (
  description: string,
  call: (client: WebClient) => Promise<unknown>,
): Promise<void> => {
  const client = await resolveBestEffortSlackClient(description);

  if (!isDefined(client)) {
    return;
  }

  await runBestEffortSlackCallWithClient(description, client, call);
};
