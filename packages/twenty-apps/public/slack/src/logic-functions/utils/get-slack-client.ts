import { WebClient, type WebClientOptions } from '@slack/web-api';

import { SLACK_CLIENT_REQUEST_TIMEOUT_MS } from 'src/logic-functions/constants/slack-client-request-timeout-ms';
import { SLACK_CLIENT_RETRY_CONFIG } from 'src/logic-functions/constants/slack-client-retry-config';
import { getSlackConnection } from 'src/logic-functions/utils/get-slack-connection';

export const getSlackClient = async (
  options?: WebClientOptions,
): Promise<
  | { success: true; client: WebClient; connectionId: string }
  | { success: false; error: string }
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
      // otherwise a 429 sleeps the whole Retry-After before any retry budget
      rejectRateLimitedCalls: true,
      ...options,
    }),
    connectionId: connectionResult.connectionId,
  };
};
