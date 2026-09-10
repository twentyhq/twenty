import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const buildRetryableGranolaError = ({
  operation,
  error,
}: {
  operation: string;
  error: unknown;
}): RetryableLogicFunctionError =>
  new RetryableLogicFunctionError(
    `[granola] ${operation} failed: ${toErrorMessage(error)}`,
  );
