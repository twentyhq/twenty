import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { getLogicFunctionExceptionHttpStatus } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/get-logic-function-exception-http-status.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

describe('getLogicFunctionExceptionHttpStatus', () => {
  it.each([
    [
      new LogicFunctionExecutionException(
        'rate limited',
        LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED,
      ),
      429,
    ],
    [
      new LogicFunctionExecutionException(
        'missing',
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      ),
      404,
    ],
    [
      new LogicFunctionException(
        'stopped',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
      ),
      403,
    ],
    [
      new LogicFunctionException(
        'platform',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_PLATFORM_EXECUTION_ERROR,
      ),
      500,
    ],
  ])('maps %s to %i', (exception, expectedStatus) => {
    expect(getLogicFunctionExceptionHttpStatus(exception)).toBe(expectedStatus);
  });
});
