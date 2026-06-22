import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import {
  ServerLogicFunctionExecutorException,
  ServerLogicFunctionExecutorExceptionCode,
} from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.exception';
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
    let outcome;

    try {
      outcome = await this.serverLogicFunctionExecutorService.run({
        applicationRegistrationUniversalIdentifier,
        logicFunctionUniversalIdentifier,
        request,
      });
    } catch (error) {
      if (error instanceof ServerLogicFunctionExecutorException) {
        throw new ServerWebhookTriggerException(
          error.message,
          mapExecutorCodeToWebhookCode(error.code),
        );
      }
      throw error;
    }

    if (outcome.kind === 'userError') {
      throw new ServerWebhookTriggerException(
        outcome.errorMessage,
        ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
      );
    }

    return outcome.response;
  }
}

const mapExecutorCodeToWebhookCode = (
  code: ServerLogicFunctionExecutorExceptionCode,
): ServerWebhookTriggerExceptionCode => {
  switch (code) {
    case ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND;
    case ServerLogicFunctionExecutorExceptionCode.APP_NOT_INSTALLED_IN_OWNER_WORKSPACE:
      return ServerWebhookTriggerExceptionCode.APPLICATION_NOT_INSTALLED;
    case ServerLogicFunctionExecutorExceptionCode.USER_UNCAUGHT_ERROR:
      return ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR;
    case ServerLogicFunctionExecutorExceptionCode.FEATURE_DISABLED:
    case ServerLogicFunctionExecutorExceptionCode.OWNER_WORKSPACE_NOT_SET:
    case ServerLogicFunctionExecutorExceptionCode.FUNCTION_DISABLED:
    default:
      return ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_PLATFORM_ERROR;
  }
};
