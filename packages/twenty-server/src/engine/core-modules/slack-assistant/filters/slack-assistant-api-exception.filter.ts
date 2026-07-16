import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { SlackAssistantException } from 'src/engine/core-modules/slack-assistant/slack-assistant.exception';
import { getSlackAssistantExceptionStatusCode } from 'src/engine/core-modules/slack-assistant/utils/get-slack-assistant-exception-status-code.util';

@Catch(SlackAssistantException)
export class SlackAssistantApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: SlackAssistantException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return this.httpExceptionHandlerService.handleError(
      exception,
      response,
      getSlackAssistantExceptionStatusCode(exception),
    );
  }
}
