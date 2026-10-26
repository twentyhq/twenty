import { type ArgumentsHost } from '@nestjs/common';

import { type HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { LogicFunctionExecutionRestApiExceptionFilter } from 'src/engine/core-modules/logic-function/logic-function-executor/filters/logic-function-execution-rest-api-exception.filter';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

describe('LogicFunctionExecutionRestApiExceptionFilter', () => {
  const response = {};
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;

  const respondWith = (
    exception: LogicFunctionException | LogicFunctionExecutionException,
  ) => {
    const handleError = jest.fn();

    new LogicFunctionExecutionRestApiExceptionFilter({
      handleError,
    } as unknown as HttpExceptionHandlerService).catch(exception, host);

    return handleError.mock.calls[0][2];
  };

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
  ])('responds to %s with %i', (exception, expectedStatus) => {
    expect(respondWith(exception)).toBe(expectedStatus);
  });
});
