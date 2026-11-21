import { reportConnectionAuthFailure } from 'twenty-sdk/logic-function';

import { GRAPH_API_INVALID_TOKEN_ERROR_CODE } from 'src/constants/graph-api-invalid-token-error-code.constant';
import { GraphApiError } from 'src/logic-functions/data/graph-api-error';

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
    }

    throw error;
  }
};
