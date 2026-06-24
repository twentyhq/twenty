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
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async handle({
    request,
    resolverLogicFunctionUniversalIdentifier,
  }: {
    request: Request;
    resolverLogicFunctionUniversalIdentifier: string;
  }): Promise<RouteTriggerResponse> {
    if (!this.twentyConfigService.get('IS_SERVER_LOGIC_FUNCTION_ENABLED')) {
      throw new ServerRouteTriggerException(
        'Server logic functions are disabled on this instance',
        ServerRouteTriggerExceptionCode.FEATURE_DISABLED,
      );
    }

    // A server-route resolver is a logic function that carries
    // `serverRouteTriggerSettings` (the opt-in marker). It runs in its own
    // workspace (the application's owner workspace).
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

    // Step 1: run the resolver. It returns
    // `{ workspaceId, targetLogicFunctionUniversalIdentifier, payload? }`,
    // selecting both the target workspace AND the target function. The
    // resolver is the single point of authorization — the URL only carries
    // the resolver's identifier.
    const resolverResult = await this.runFunction({
      logicFunctionId: resolver.id,
      workspaceId: resolver.workspaceId,
      payload: event,
    });
    const resolved = this.parseResolverResult(resolverResult);

    // Step 2: look up the target in the resolved workspace via the cache,
    // then run it. The target is a regular workspace logic function —
    // addressed by the universalIdentifier the resolver returned.
    const targetLogicFunctionId = await this.findCachedLogicFunctionId({
      workspaceId: resolved.workspaceId,
      logicFunctionUniversalIdentifier:
        resolved.targetLogicFunctionUniversalIdentifier,
    });

    if (!isDefined(targetLogicFunctionId)) {
      throw new ServerRouteTriggerException(
        `Target logic function ${resolved.targetLogicFunctionUniversalIdentifier} not found in workspace ${resolved.workspaceId}`,
        ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const targetResult = await this.runFunction({
      logicFunctionId: targetLogicFunctionId,
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
    // `(universalIdentifier, workspaceId)` is the SyncableEntity unique key,
    // so a single universalIdentifier can have one row per workspace that
    // installed the app. The resolver lives in the application
    // registration's *owner workspace* — that's the canonical, manifest-
    // managed copy. We load the application -> applicationRegistration
    // chain and keep the one whose workspaceId matches the
    // registration's ownerWorkspaceId. Other workspaces' copies are
    // intentionally ignored even if they carry serverRouteTriggerSettings.
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

  private async findCachedLogicFunctionId({
    workspaceId,
    logicFunctionUniversalIdentifier,
  }: {
    workspaceId: string;
    logicFunctionUniversalIdentifier: string;
  }): Promise<string | undefined> {
    let flatLogicFunctionMaps;

    try {
      ({ flatLogicFunctionMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatLogicFunctionMaps',
        ]));
    } catch (error) {
      // Cache outage / DB failure / recompute bug. Surface as platform
      // error so the caller sees a 5xx instead of a misleading 404.
      this.logger.error(
        `Failed to read flatLogicFunctionMaps for workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServerRouteTriggerException(
        `Failed to read logic functions for workspace ${workspaceId}`,
        ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR,
      );
    }

    const logicFunction = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    ).find(
      (candidate) =>
        isDefined(candidate) &&
        candidate.universalIdentifier === logicFunctionUniversalIdentifier &&
        !isDefined(candidate.deletedAt),
    );

    return isDefined(logicFunction) ? logicFunction.id : undefined;
  }

  private async runFunction({
    logicFunctionId,
    workspaceId,
    payload,
  }: {
    logicFunctionId: string;
    workspaceId: string;
    payload: object;
  }): Promise<{ data: object | null; error?: { errorMessage: string } }> {
    try {
      return await this.logicFunctionExecutorService.execute({
        logicFunctionId,
        workspaceId,
        payload,
      });
    } catch (error) {
      this.logger.error(
        `Server logic function ${logicFunctionId} failed in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
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
