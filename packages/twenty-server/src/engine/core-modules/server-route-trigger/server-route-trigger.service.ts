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
import { buildLogicFunctionEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import {
  type RouteTriggerResponse,
  buildRouteTriggerResponse,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

type ResolverResult = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload?: object;
};

@Injectable()
export class ServerRouteTriggerService {
  private readonly logger = new Logger(ServerRouteTriggerService.name);

  constructor(
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
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

    const targetResult = await this.runFunction({
      logicFunctionUniversalIdentifier:
        resolved.targetLogicFunctionUniversalIdentifier,
      workspaceId: resolved.workspaceId,
      payload: resolved.payload ?? event,
    });

    if (isDefined(targetResult.error)) {
      throw new ServerRouteTriggerException(
        targetResult.error.errorMessage,
        ServerRouteTriggerExceptionCode.SERVER_ROUTE_USER_UNCAUGHT_ERROR,
      );
    }

    return buildRouteTriggerResponse(targetResult.data);
  }

  private async findResolver({
    logicFunctionUniversalIdentifier,
  }: {
    logicFunctionUniversalIdentifier: string;
  }): Promise<LogicFunctionEntity | null> {
    const candidates = await this.logicFunctionRepository.find({
      where: { universalIdentifier: logicFunctionUniversalIdentifier },
      relations: { application: { applicationRegistration: true } },
    });

    return (
      candidates.find(
        (candidate) =>
          isDefined(candidate.application?.applicationRegistration) &&
          candidate.workspaceId ===
            candidate.application.applicationRegistration.ownerWorkspaceId,
      ) ?? null
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

  private async runFunction({
    logicFunctionUniversalIdentifier,
    workspaceId,
    payload,
  }: {
    logicFunctionUniversalIdentifier: string;
    workspaceId: string;
    payload: object;
  }): Promise<{ data: object | null; error?: { errorMessage: string } }> {
    const logicFunction = await this.logicFunctionRepository.findOne({
      where: {
        universalIdentifier: logicFunctionUniversalIdentifier,
        workspaceId,
      },
    });

    if (!isDefined(logicFunction)) {
      throw new ServerRouteTriggerException(
        `Logic function ${logicFunctionUniversalIdentifier} not found in workspace ${workspaceId}`,
        ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

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
      throw new ServerRouteTriggerException(
        error instanceof Error ? error.message : String(error),
        this.mapExecutorErrorToServerRouteCode(error),
      );
    }
  }

  private mapExecutorErrorToServerRouteCode(
    error: unknown,
  ): ServerRouteTriggerExceptionCode {
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
