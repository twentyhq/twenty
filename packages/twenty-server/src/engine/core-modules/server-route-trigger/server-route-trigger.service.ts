import { Injectable, Logger } from '@nestjs/common';

import { Request } from 'express';
import { isLogicFunctionHttpResponse } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type SelectQueryBuilder } from 'typeorm';

import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { buildLogicFunctionEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  buildRouteTriggerResponse,
  type RouteTriggerResponse,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { DEFAULT_SERVER_ROUTE_HTTP_METHODS } from 'src/engine/core-modules/server-route-trigger/constants/default-server-route-http-methods.constant';
import { SERVER_ROUTE_DISPATCH_JOB_PRIORITY } from 'src/engine/core-modules/server-route-trigger/constants/server-route-dispatch-job-priority.constant';
import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { parseResolverDispatchResultOrThrow } from 'src/engine/core-modules/server-route-trigger/utils/parse-resolver-dispatch-result-or-throw.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const QUEUED_TARGET_RETRY_LIMIT = 3;

export type ServerRouteTriggerResult = {
  response: RouteTriggerResponse;
  isResolvedThroughLegacyIdentifier: boolean;
};

type ResolvedServerRouteResolver = {
  resolver: LogicFunctionEntity;
  isResolvedThroughLegacyIdentifier: boolean;
};

@Injectable()
export class ServerRouteTriggerService {
  private readonly logger = new Logger(ServerRouteTriggerService.name);

  constructor(
    @InjectWorkspaceScopedRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async handle({
    request,
    resolverLogicFunctionIdentifier,
  }: {
    request: Request;
    resolverLogicFunctionIdentifier: string;
  }): Promise<ServerRouteTriggerResult> {
    const { resolver, isResolvedThroughLegacyIdentifier } =
      await this.findResolverOrThrow(resolverLogicFunctionIdentifier);

    const allowedHttpMethods =
      resolver.serverRouteTriggerSettings?.httpMethods ??
      DEFAULT_SERVER_ROUTE_HTTP_METHODS;

    if (
      !allowedHttpMethods.some((httpMethod) => httpMethod === request.method)
    ) {
      throw new ServerRouteTriggerException(
        `Server resolver function ${resolverLogicFunctionIdentifier} does not accept ${request.method} requests`,
        ServerRouteTriggerExceptionCode.METHOD_NOT_ALLOWED,
      );
    }

    if (resolver.httpRouteTriggerSettings?.isAuthRequired === true) {
      throw new ServerRouteTriggerException(
        `Server resolver function ${resolverLogicFunctionIdentifier} requires authentication and cannot be dispatched through the public server route`,
        ServerRouteTriggerExceptionCode.RESOLVER_REQUIRES_AUTHENTICATION,
      );
    }

    const applicationRegistrationId =
      resolver.application?.applicationRegistration?.id;

    if (!isDefined(applicationRegistrationId)) {
      throw new ServerRouteTriggerException(
        `Server resolver function ${resolverLogicFunctionIdentifier} is not linked to an application registration`,
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

    if (isDefined(resolverResult.error)) {
      throw new ServerRouteTriggerException(
        resolverResult.error.errorMessage,
        ServerRouteTriggerExceptionCode.SERVER_ROUTE_USER_UNCAUGHT_ERROR,
      );
    }

    if (isLogicFunctionHttpResponse(resolverResult.data)) {
      return {
        response: buildRouteTriggerResponse(resolverResult.data),
        isResolvedThroughLegacyIdentifier,
      };
    }

    const dispatchResult = parseResolverDispatchResultOrThrow(
      resolverResult.data,
    );

    return {
      response: await this.enqueueTargetFunction({
        logicFunctionUniversalIdentifier:
          dispatchResult.targetLogicFunctionUniversalIdentifier,
        workspaceId: dispatchResult.workspaceId,
        payload: dispatchResult.payload ?? event,
        applicationRegistrationId,
      }),
      isResolvedThroughLegacyIdentifier,
    };
  }

  private createResolverQueryBuilder(): SelectQueryBuilder<LogicFunctionEntity> {
    return this.logicFunctionRepository
      .createQueryBuilder('logicFunction')
      .innerJoinAndSelect('logicFunction.application', 'application')
      .innerJoinAndSelect(
        'application.applicationRegistration',
        'applicationRegistration',
      )
      .where('logicFunction.serverRouteTriggerSettings IS NOT NULL')
      .andWhere(
        'logicFunction.workspaceId = applicationRegistration.ownerWorkspaceId',
      );
  }

  private async findResolverOrThrow(
    identifier: string,
  ): Promise<ResolvedServerRouteResolver> {
    const resolverById = await this.createResolverQueryBuilder()
      .andWhere('logicFunction.id = :id', { id: identifier })
      .getOne();

    if (isDefined(resolverById)) {
      return {
        resolver: resolverById,
        isResolvedThroughLegacyIdentifier: false,
      };
    }

    const legacyCandidates = await this.createResolverQueryBuilder()
      .andWhere('logicFunction.universalIdentifier = :universalIdentifier', {
        universalIdentifier: identifier,
      })
      .limit(2)
      .getMany();

    if (legacyCandidates.length > 1) {
      this.logger.error(
        `Server route ${identifier} is claimed by ${legacyCandidates.length} application registrations (owner workspaces: ${legacyCandidates
          .map((candidate) => candidate.workspaceId)
          .join(', ')}); refusing to dispatch`,
      );
    }

    const legacyResolver =
      legacyCandidates.length === 1 ? legacyCandidates[0] : undefined;

    if (!isDefined(legacyResolver)) {
      throw new ServerRouteTriggerException(
        `Server resolver function ${identifier} not found`,
        ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    this.logger.warn(
      `Server route ${identifier} resolved through the deprecated universalIdentifier form (application registration ${legacyResolver.application?.applicationRegistration?.universalIdentifier}, owner workspace ${legacyResolver.workspaceId}); the registered URL should move to /webhooks/server/${legacyResolver.id}`,
    );

    return {
      resolver: legacyResolver,
      isResolvedThroughLegacyIdentifier: true,
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

    await this.messageQueueService.add<LogicFunctionTriggerJobData>(
      LogicFunctionTriggerJob.name,
      {
        logicFunctionId: logicFunction.id,
        workspaceId,
        payload,
      },
      {
        retryLimit: QUEUED_TARGET_RETRY_LIMIT,
        backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
        priority: SERVER_ROUTE_DISPATCH_JOB_PRIORITY,
      },
    );

    return { statusCode: 200, headers: {}, body: { queued: true } };
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
    const logicFunction = await this.logicFunctionRepository.findOne(
      workspaceId,
      {
        where: {
          universalIdentifier: logicFunctionUniversalIdentifier,
          ...(isDefined(applicationRegistrationId)
            ? { application: { applicationRegistrationId } }
            : {}),
        },
        ...(isDefined(applicationRegistrationId)
          ? { relations: { application: true } }
          : {}),
      },
    );

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
      if (isUsageRefusedError(error)) {
        throw error;
      }

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
