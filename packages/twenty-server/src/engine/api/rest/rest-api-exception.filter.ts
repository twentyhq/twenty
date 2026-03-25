import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

@Catch()
export class RestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : 400; // should actually default to 500 but we dont have input validation yet and dont want to be flooded with errors from input https://github.com/twentyhq/core-team-issues/issues/1027

    return this.httpExceptionHandlerService.handleError(
      exception as Error | HttpException,
      response,
      statusCode,
    );
  }
}
