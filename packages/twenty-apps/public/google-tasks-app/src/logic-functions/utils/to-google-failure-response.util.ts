import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { getErrorMessage } from 'src/logic-functions/utils/get-error-message.util';
import {
  isGoogleAuthorizationFailure,
  isTransientGoogleError,
} from 'src/logic-functions/utils/google-error.util';

export const toGoogleFailureResponseOrThrow = ({
  error,
  connectionId,
  authorizationError,
}: {
  error: unknown;
  connectionId: string;
  authorizationError: string;
}) => {
  if (isTransientGoogleError(error)) {
    throw new RetryableLogicFunctionError(
      `Google Tasks is temporarily unavailable for connection ${connectionId}: ${getErrorMessage(error)}`,
    );
  }

  if (isGoogleAuthorizationFailure(error)) {
    return {
      success: false,
      error: authorizationError,
    };
  }

  throw error;
};
