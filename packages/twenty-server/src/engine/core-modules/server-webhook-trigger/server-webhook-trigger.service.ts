import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import {
  ServerWebhookTriggerException,
  ServerWebhookTriggerExceptionCode,
} from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Injectable()
export class ServerWebhookTriggerService {
  constructor(
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    private readonly logicFunctionTriggerService: LogicFunctionTriggerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async handle({
    request,
    logicFunctionUniversalIdentifier,
  }: {
    request: Request;
    logicFunctionUniversalIdentifier: string;
  }): Promise<RouteTriggerResponse> {
    if (!this.twentyConfigService.get('IS_SERVER_LOGIC_FUNCTION_ENABLED')) {
      throw new ServerWebhookTriggerException(
        'Server logic functions are disabled on this instance',
        ServerWebhookTriggerExceptionCode.FEATURE_DISABLED,
      );
    }

    // A logic function is server-exposed iff it carries
    // `serverWebhookTriggerSettings`. We resolve it from the owner
    // workspace's copy via the application -> applicationRegistration chain;
    // billing, throttling, env vars all apply against that workspace.
    const ownerLogicFunction = await this.logicFunctionRepository
      .createQueryBuilder('lf')
      .innerJoin(
        'core.application',
        'app',
        'app.id = lf."applicationId"',
      )
      .innerJoin(
        'core.applicationRegistration',
        'reg',
        'reg.id = app."applicationRegistrationId"',
      )
      .where('lf."universalIdentifier" = :uid', {
        uid: logicFunctionUniversalIdentifier,
      })
      .andWhere('lf."workspaceId" = reg."workspaceId"')
      .andWhere('lf."serverWebhookTriggerSettings" IS NOT NULL')
      .andWhere('lf."deletedAt" IS NULL')
      .andWhere('reg."deletedAt" IS NULL')
      .andWhere('reg."workspaceId" IS NOT NULL')
      .getOne();

    if (!isDefined(ownerLogicFunction)) {
      throw new ServerWebhookTriggerException(
        `Server logic function ${logicFunctionUniversalIdentifier} not found`,
        ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const outcome = await this.logicFunctionTriggerService.run({
      logicFunction: ownerLogicFunction,
      request,
      pathParameters: {},
      forwardedRequestHeaders:
        ownerLogicFunction.serverWebhookTriggerSettings
          ?.forwardedRequestHeaders ?? [],
      userId: null,
      userWorkspaceId: null,
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
