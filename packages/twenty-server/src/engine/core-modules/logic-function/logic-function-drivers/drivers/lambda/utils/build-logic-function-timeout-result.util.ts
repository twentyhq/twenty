import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

// A client-side invoke timeout means the function used up its allotted execution
// time. This is a user/function-level outcome — the same as the Lambda's own
// timeout (FunctionError) and the local driver — so it is returned as an ERROR
// result instead of being thrown as a platform exception that would be captured
// by Sentry.
export const buildLogicFunctionTimeoutResult = (
  timeoutMs: number,
): LogicFunctionExecuteResult => ({
  data: null,
  logs: '',
  duration: timeoutMs,
  status: LogicFunctionExecutionStatus.ERROR,
  error: {
    errorType: 'TimeoutError',
    errorMessage: `Function execution timed out after ${Math.round(timeoutMs / 1_000)}s`,
    stackTrace: [],
  },
});
