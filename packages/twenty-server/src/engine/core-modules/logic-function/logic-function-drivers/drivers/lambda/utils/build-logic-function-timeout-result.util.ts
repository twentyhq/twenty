import { LOGIC_FUNCTION_TIMEOUT_ERROR_TYPE } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-timeout-error-type.constant';
import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

export const buildLogicFunctionTimeoutResult = (
  timeoutMs: number,
): LogicFunctionExecuteResult => ({
  data: null,
  logs: '',
  duration: timeoutMs,
  billedDurationMs: timeoutMs,
  status: LogicFunctionExecutionStatus.ERROR,
  error: {
    errorType: LOGIC_FUNCTION_TIMEOUT_ERROR_TYPE,
    errorMessage: `Function execution timed out after ${Math.round(timeoutMs / 1_000)}s`,
    stackTrace: [],
  },
});
