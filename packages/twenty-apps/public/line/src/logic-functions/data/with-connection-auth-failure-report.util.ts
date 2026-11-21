import { reportConnectionAuthFailure } from 'twenty-sdk/logic-function';

import { LineApiError } from 'src/logic-functions/data/line-api.error';

const LINE_INVALID_TOKEN_STATUS = 401;

// a reissued long-lived token revokes the previous one, so the member must reconnect with the new one
export const withConnectionAuthFailureReport = async <TResult>(
  connectedAccountId: string,
  request: () => Promise<TResult>,
): Promise<TResult> => {
  try {
    return await request();
  } catch (error) {
    if (
      error instanceof LineApiError &&
      error.status === LINE_INVALID_TOKEN_STATUS
    ) {
      await reportConnectionAuthFailure({
        connectionId: connectedAccountId,
        reason: error.message,
      });
    }

    throw error;
  }
};
