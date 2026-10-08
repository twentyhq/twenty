import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import { buildRetryableGranolaError } from 'src/logic-functions/utils/build-retryable-granola-error.util';

export const rethrowKnownOrWrapGranolaError = ({
  operation,
  error,
}: {
  operation: string;
  error: unknown;
}): never => {
  if (
    error instanceof RetryableLogicFunctionError ||
    error instanceof GranolaApiError ||
    error instanceof GranolaInvalidResponseError
  ) {
    throw error;
  }

  throw buildRetryableGranolaError({ operation, error });
};
