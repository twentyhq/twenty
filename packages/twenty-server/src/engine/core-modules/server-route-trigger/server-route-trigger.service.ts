import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isString } from '@sniptt/guards';
import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { buildLogicFunctionEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

type ResolverResult = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload?: object;
};

const QUEUED_TARGET_RETRY_LIMIT = 3;

@Injectable()
export class ServerRouteTriggerService {
  private readonly logger = new Logger(ServerRouteTriggerService.name);

  constructor(
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async handle({
    request,
    resolverLogicFunctionUniversalIdentifier,
  }: {
    request: Request;
    resolverLogicFunctionUniversalIdentifier: string;
  }): Promise<RouteTriggerResponse> {
    const resolver = await this.findResolver({
      logicFunctionUniversalIdentifier:
        resolverLogicFunctionUniversalIdentifier,
    });

    if (!isDefined(resolver)) {
      throw new ServerRouteTriggerException(
        `Server resolver function ${resolverLogicFunctionUniversalIdentifier} not found`,
        ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    if (resolver.httpRouteTriggerSettings?.isAuthRequired === true) {
      throw new ServerRouteTriggerException(
        `Server resolver function ${resolverLogicFunctionUniversalIdentifier} requires authentication and cannot be dispatched through the public server route`,
        ServerRouteTriggerExceptionCode.RESOLVER_REQUIRES_AUTHENTICATION,
      );
    }

    const applicationRegistrationId =
      resolver.application?.applicationRegistration?.id;

    if (!isDefined(applicationRegistrationId)) {
      throw new ServerRouteTriggerException(
        `Server resolver function ${resolverLogicFunctionUniversalIdentifier} is not linked to an application registration`,
        ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const event = buildLogicFunctionEvent({
      request,
      pathParameters: {},
      forwardedRequestHeaders:
        resolver.serverRouteTriggerSettings?.forwardedRequestHeaders ?? [],
      userWorkspaceId: null,
    });

    const resolverResult = await this.runFunction({
      logicFunctionUniversalIdentifier: resolver.universalIdentifier,
      workspaceId: resolver.workspaceId,
      payload: event,
    });
    const resolved = this.parseResolverResult(resolverResult);

    return await this.enqueueTargetFunction({
      logicFunctionUniversalIdentifier:
        resolved.targetLogicFunctionUniversalIdentifier,
      workspaceId: resolved.workspaceId,
      payload: resolved.payload ?? event,
      applicationRegistrationId,
    });
  }

  private async findResolver({
    logicFunctionUniversalIdentifier,
  }: {
    logicFunctionUniversalIdentifier: string;
  }): Promise<LogicFunctionEntity | null> {
    return (
      (await this.logicFunctionRepository
        .createQueryBuilder('logicFunction')
        .innerJoinAndSelect('logicFunction.application', 'application')
        .innerJoinAndSelect(
          'application.applicationRegistration',
          'applicationRegistration',
        )
        .where('logicFunction.universalIdentifier = :universalIdentifier', {
          universalIdentifier: logicFunctionUniversalIdentifier,
        })
        .andWhere('logicFunction.serverRouteTriggerSettings IS NOT NULL')
        .andWhere(
          'logicFunction.workspaceId = applicationRegistration.ownerWorkspaceId',
        )
        .getOne()) ?? null
    );
  }

  private parseResolverResult(result: {
    data: object | null;
    error?: { errorMessage: string };
  }): ResolverResult {
    if (isDefined(result.error)) {
      throw new ServerRouteTriggerException(
        result.error.errorMessage,
        ServerRouteTriggerExceptionCode.SERVER_ROUTE_USER_UNCAUGHT_ERROR,
      );
    }

    const data = result.data as {
      workspaceId?: unknown;
      targetLogicFunctionUniversalIdentifier?: unknown;
      payload?: unknown;
    };

    if (
      !isString(data?.workspaceId) ||
      !isString(data?.targetLogicFunctionUniversalIdentifier)
    ) {
      throw new ServerRouteTriggerException(
        'Resolver logic function must return { workspaceId: string; targetLogicFunctionUniversalIdentifier: string; payload?: object }',
        ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT,
      );
    }

    return {
      workspaceId: data.workspaceId,
      targetLogicFunctionUniversalIdentifier:
        data.targetLogicFunctionUniversalIdentifier,
      payload:
        typeof data.payload === 'object' && data.payload !== null
          ? (data.payload as object)
          : undefined,
    };
  }

  private async enqueueTargetFunction({
    logicFunctionUniversalIdentifier,
    workspaceId,
    payload,
    applicationRegistrationId,
  }: {
    logicFunctionUniversalIdentifier: string;
    workspaceId: string;
    payload: object;
    applicationRegistrationId: string;
  }): Promise<RouteTriggerResponse> {
    const logicFunction = await this.findLogicFunctionOrFail({
      logicFunctionUniversalIdentifier,
      workspaceId,
      applicationRegistrationId,
    });

    await this.messageQueueService.add<LogicFunctionTriggerJobData[]>(
      LogicFunctionTriggerJob.name,
      [
        {
          logicFunctionId: logicFunction.id,
          workspaceId,
          payload,
        },
      ],
      { retryLimit: QUEUED_TARGET_RETRY_LIMIT },
    );

    return { statusCode: 202, headers: {}, body: { queued: true } };
  }

  private async findLogicFunctionOrFail({
    logicFunctionUniversalIdentifier,
    workspaceId,
    applicationRegistrationId,
  }: {
    logicFunctionUniversalIdentifier: string;
    workspaceId: string;
    applicationRegistrationId?: string;
  }): Promise<LogicFunctionEntity> {
    const logicFunction = await this.logicFunctionRepository.findOne({
      where: {
        universalIdentifier: logicFunctionUniversalIdentifier,
        workspaceId,
        ...(isDefined(applicationRegistrationId)
          ? { application: { applicationRegistrationId } }
          : {}),
      },
      ...(isDefined(applicationRegistrationId)
        ? { relations: { application: true } }
        : {}),
    });

    if (!isDefined(logicFunction)) {
      throw new ServerRouteTriggerException(
        `Logic function ${logicFunctionUniversalIdentifier} not found in workspace ${workspaceId}`,
        ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    return logicFunction;
  }

  private async runFunction({
    logicFunctionUniversalIdentifier,
    workspaceId,
    payload,
  }: {
    logicFunctionUniversalIdentifier: string;
    workspaceId: string;
    payload: object;
  }): Promise<{ data: object | null; error?: { errorMessage: string } }> {
    const logicFunction = await this.findLogicFunctionOrFail({
      logicFunctionUniversalIdentifier,
      workspaceId,
    });

    try {
      return await this.logicFunctionExecutorService.execute({
        logicFunctionId: logicFunction.id,
        workspaceId,
        payload,
      });
    } catch (error) {
      this.logger.error(
        `Server logic function ${logicFunction.id} failed in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      const code = this.mapExecutorErrorToServerRouteCode(error);

      throw new ServerRouteTriggerException(
        this.getPublicErrorMessageForCode(code),
        code,
      );
    }
  }

  private getPublicErrorMessageForCode(
    code: ServerRouteTriggerExceptionCode,
  ): string {
    switch (code) {
      case ServerRouteTriggerExceptionCode.RATE_LIMIT_EXCEEDED:
        return 'Rate limit exceeded';
      case ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        return 'Logic function not found';
      case ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_DISABLED:
        return 'Logic function execution is disabled';
      default:
        return 'An unexpected error occurred while handling the server route';
    }
  }

  private mapExecutorErrorToServerRouteCode(
    error: unknown,
  ): ServerRouteTriggerExceptionCode {
    if (
      error instanceof LogicFunctionException &&
      error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED
    ) {
      return ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_DISABLED;
    }

    if (!(error instanceof LogicFunctionExecutionException)) {
      return ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR;
    }

    switch (error.code) {
      case LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        return ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND;
      case LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED:
        return ServerRouteTriggerExceptionCode.RATE_LIMIT_EXCEEDED;
      default:
        return ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR;
    }
  }
}
