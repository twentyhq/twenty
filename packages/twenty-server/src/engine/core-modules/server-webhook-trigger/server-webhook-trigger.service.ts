import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';
import {
  ServerWebhookTriggerException,
  ServerWebhookTriggerExceptionCode,
} from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';

@Injectable()
export class ServerWebhookTriggerService {
  constructor(
    private readonly serverLogicFunctionExecutorService: ServerLogicFunctionExecutorService,
  ) {}

  async handle({
    request,
    applicationRegistrationUniversalIdentifier,
    logicFunctionUniversalIdentifier,
  }: {
    request: Request;
    applicationRegistrationUniversalIdentifier: string;
    logicFunctionUniversalIdentifier: string;
  }): Promise<RouteTriggerResponse> {
    const outcome = await this.serverLogicFunctionExecutorService.run({
      applicationRegistrationUniversalIdentifier,
      logicFunctionUniversalIdentifier,
      request,
    });

    if (outcome.kind === 'userError') {
      throw new ServerWebhookTriggerException(
        outcome.errorMessage,
        ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
      );
    }

    return outcome.response;
  }
}
