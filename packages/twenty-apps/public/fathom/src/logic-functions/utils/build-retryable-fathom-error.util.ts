import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const buildRetryableFathomError = ({
  operation,
  error,
}: {
  operation: string;
  error: unknown;
}): RetryableLogicFunctionError =>
  Object.assign(
    new RetryableLogicFunctionError(
      `[fathom] ${operation} failed: ${toErrorMessage(error)}`,
    ),
    { cause: error },
  );
