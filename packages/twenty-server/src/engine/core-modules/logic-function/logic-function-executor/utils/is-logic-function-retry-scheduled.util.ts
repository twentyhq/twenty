import {
  type LogicFunctionRetryContext,
  RETRYABLE_LOGIC_FUNCTION_ERROR_NAME,
} from 'twenty-shared/logic-function';

import { type LogicFunctionExecuteError } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

export const isLogicFunctionRetryScheduled = ({
  error,
  retry: { retryCount, maxRetries },
}: {
  error: LogicFunctionExecuteError | undefined;
  retry: LogicFunctionRetryContext;
}): boolean =>
  error?.errorType === RETRYABLE_LOGIC_FUNCTION_ERROR_NAME &&
  retryCount < maxRetries;
