import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { MessageQueueException } from 'src/engine/core-modules/message-queue/message-queue.exception';

@Catch(MessageQueueException)
export class MessageQueueRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: MessageQueueException, host: ArgumentsHost) {
    return this.httpExceptionHandlerService.handleError(
      exception,
      host.switchToHttp().getResponse<Response>(),
      exception.statusCode,
      undefined,
      undefined,
      { shouldBeCapturedBySentry: false },
    );
  }
}
