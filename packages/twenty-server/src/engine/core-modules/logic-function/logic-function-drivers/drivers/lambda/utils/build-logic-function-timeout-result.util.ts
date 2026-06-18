import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

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
