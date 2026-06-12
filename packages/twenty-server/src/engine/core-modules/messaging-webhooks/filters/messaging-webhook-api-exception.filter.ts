import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { MessagingWebhookException } from 'src/engine/core-modules/messaging-webhooks/messaging-webhook.exception';
import { getMessagingWebhookExceptionStatusCode } from 'src/engine/core-modules/messaging-webhooks/utils/get-messaging-webhook-exception-status-code.util';

@Catch(MessagingWebhookException)
export class MessagingWebhookApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: MessagingWebhookException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return this.httpExceptionHandlerService.handleError(
      exception,
      response,
      getMessagingWebhookExceptionStatusCode(exception),
    );
  }
}
