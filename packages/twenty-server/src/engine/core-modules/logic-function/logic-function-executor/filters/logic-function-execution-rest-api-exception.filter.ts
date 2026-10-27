import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { LogicFunctionExecutionException } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { getLogicFunctionExceptionHttpStatus } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/get-logic-function-exception-http-status.util';
import { LogicFunctionException } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

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
