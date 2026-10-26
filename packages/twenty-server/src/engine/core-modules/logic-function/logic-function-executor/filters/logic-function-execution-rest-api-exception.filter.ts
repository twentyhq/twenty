import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';
import { assertUnreachable } from 'twenty-shared/utils';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const getLogicFunctionExceptionHttpStatus = (
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

@Injectable()
@Catch(LogicFunctionException, LogicFunctionExecutionException)
export class LogicFunctionExecutionRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(
    exception: LogicFunctionException | LogicFunctionExecutionException,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse<Response>();

    return this.httpExceptionHandlerService.handleError(
      exception,
      response,
      getLogicFunctionExceptionHttpStatus(exception),
    );
  }
}
