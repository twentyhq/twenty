import { assertUnreachable } from 'twenty-shared/utils';

import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  type LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export const getLogicFunctionExceptionHttpStatus = (
  exception: LogicFunctionException | LogicFunctionExecutionException,
): number => {
  if (exception instanceof LogicFunctionExecutionException) {
    const { code } = exception;

    switch (code) {
      case LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        return 404;
      case LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED:
        return 429;
      default:
        return assertUnreachable(code);
    }
  }

  switch (exception.code) {
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return 404;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED:
      return 403;
    default:
      return 500;
  }
};
