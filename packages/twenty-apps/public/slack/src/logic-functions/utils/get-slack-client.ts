import { WebClient, type WebClientOptions } from '@slack/web-api';

import { SLACK_CLIENT_REQUEST_TIMEOUT_MS } from 'src/logic-functions/constants/slack-client-request-timeout-ms';
import { SLACK_CLIENT_RETRY_CONFIG } from 'src/logic-functions/constants/slack-client-retry-config';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';

export const getSlackClient = async (
  options?: WebClientOptions,
): Promise<
  { success: true; client: WebClient } | { success: false; error: string }
> => {
  const connectionResult = await getSlackConnection();

  if (!connectionResult.success) {
    return connectionResult;
  }

  return {
    success: true,
    client: new WebClient(connectionResult.accessToken, {
      timeout: SLACK_CLIENT_REQUEST_TIMEOUT_MS,
      retryConfig: SLACK_CLIENT_RETRY_CONFIG,
      // without this a 429 sleeps for the whole Retry-After before the retry
      // budget even applies, which no logic function here can afford
      rejectRateLimitedCalls: true,
      ...options,
    }),
  };
};
