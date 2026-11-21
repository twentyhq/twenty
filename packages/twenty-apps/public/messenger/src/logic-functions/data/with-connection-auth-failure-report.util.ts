import { reportConnectionAuthFailure } from 'twenty-sdk/logic-function';

import { GRAPH_API_INVALID_TOKEN_ERROR_CODE } from 'src/constants/graph-api-invalid-token-error-code.constant';
import { GraphApiError } from 'src/logic-functions/data/graph-api.error';
import { sendInboxNotification } from 'src/logic-functions/data/send-inbox-notification.util';

export const withConnectionAuthFailureReport = async <TResult>(
  connectedAccountId: string,
  request: () => Promise<TResult>,
): Promise<TResult> => {
  try {
    return await request();
  } catch (error) {
    if (
      error instanceof GraphApiError &&
      error.code === GRAPH_API_INVALID_TOKEN_ERROR_CODE
    ) {
      await reportConnectionAuthFailure({
        connectionId: connectedAccountId,
        reason: error.message,
      });
      await sendInboxNotification({
        threadKey: `connection_failed:${connectedAccountId}`,
        idempotencyKey: `connection_failed:${connectedAccountId}:${error.message}`,
        title: 'Messenger needs to be reconnected',
        text: `Meta no longer accepts the Messenger token, so messages are not received or sent. Generate a new system user token and reconnect Messenger. ${error.message}`,
      });
    }

    throw error;
  }
};
