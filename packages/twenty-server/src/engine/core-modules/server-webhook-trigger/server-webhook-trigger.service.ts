import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
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
  ServerWebhookTriggerException,
  ServerWebhookTriggerExceptionCode,
} from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ResolverResult = {
  workspaceId: string;
  payload?: object;
};

@Injectable()
export class ServerWebhookTriggerService {
  private readonly logger = new Logger(ServerWebhookTriggerService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async handle({
    request,
    resolverLogicFunctionUniversalIdentifier,
    targetLogicFunctionUniversalIdentifier,
  }: {
    request: Request;
    resolverLogicFunctionUniversalIdentifier: string;
    targetLogicFunctionUniversalIdentifier: string;
  }): Promise<RouteTriggerResponse> {
    if (!this.twentyConfigService.get('IS_SERVER_LOGIC_FUNCTION_ENABLED')) {
      throw new ServerWebhookTriggerException(
        'Server logic functions are disabled on this instance',
        ServerWebhookTriggerExceptionCode.FEATURE_DISABLED,
      );
    }

    // The resolver lives in an application-registration owner workspace and
    // carries `serverWebhookTriggerSettings`. We look it up via the workspace
    // cache, restricted to owner workspaces of (alive) application
    // registrations.
    const resolverMatch = await this.findResolverInOwnerWorkspaces(
      resolverLogicFunctionUniversalIdentifier,
    );

    if (!isDefined(resolverMatch)) {
      throw new ServerWebhookTriggerException(
        `Server resolver function ${resolverLogicFunctionUniversalIdentifier} not found`,
        ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const event = buildLogicFunctionEvent({
      request,
      pathParameters: {},
      forwardedRequestHeaders:
        resolverMatch.logicFunction.serverWebhookTriggerSettings
          ?.forwardedRequestHeaders ?? [],
      userWorkspaceId: null,
    });

    // Step 1: run the resolver in the owner workspace. It returns
    // `{ workspaceId, payload? }` selecting the target workspace and
    // (optionally) transforming the payload handed to the target.
    const resolverResult = await this.runFunction({
      logicFunctionId: resolverMatch.logicFunction.id,
      workspaceId: resolverMatch.ownerWorkspaceId,
      payload: event,
    });
    const resolved = this.parseResolverResult(resolverResult);

    // Step 2: look up the target in the resolved workspace via the cache,
    // then run it. The target is a regular workspace logic function — no
    // server-trigger settings required — addressed by universalIdentifier.
    const targetLogicFunction = await this.findCachedLogicFunction({
      workspaceId: resolved.workspaceId,
      universalIdentifier: targetLogicFunctionUniversalIdentifier,
    });

    if (!isDefined(targetLogicFunction)) {
      throw new ServerWebhookTriggerException(
        `Target logic function ${targetLogicFunctionUniversalIdentifier} not found in workspace ${resolved.workspaceId}`,
        ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const targetResult = await this.runFunction({
      logicFunctionId: targetLogicFunction.id,
      workspaceId: resolved.workspaceId,
      payload: resolved.payload ?? event,
    });

    if (isDefined(targetResult.error)) {
      throw new ServerWebhookTriggerException(
        targetResult.error.errorMessage,
        ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
      );
    }

    return buildRouteTriggerResponse(targetResult.data);
  }

  private async findResolverInOwnerWorkspaces(
    universalIdentifier: string,
  ): Promise<
    { ownerWorkspaceId: string; logicFunction: FlatLogicFunction } | undefined
  > {
    const registrations = await this.applicationRegistrationRepository.find({
      where: { ownerWorkspaceId: Not(IsNull()) },
      select: ['ownerWorkspaceId'],
    });

    const ownerWorkspaceIds = Array.from(
      new Set(
        registrations
          .map((registration) => registration.ownerWorkspaceId)
          .filter((workspaceId): workspaceId is string =>
            isDefined(workspaceId),
          ),
      ),
    );

    for (const ownerWorkspaceId of ownerWorkspaceIds) {
      const logicFunction = await this.findCachedLogicFunction({
        workspaceId: ownerWorkspaceId,
        universalIdentifier,
        requireServerWebhookTrigger: true,
      });

      if (isDefined(logicFunction)) {
        return { ownerWorkspaceId, logicFunction };
      }
    }

    return undefined;
  }

  private parseResolverResult(result: {
    data: object | null;
    error?: { errorMessage: string };
  }): ResolverResult {
    if (isDefined(result.error)) {
      throw new ServerWebhookTriggerException(
        result.error.errorMessage,
        ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
      );
    }

    const data = result.data as { workspaceId?: unknown; payload?: unknown };
    const workspaceId =
      typeof data?.workspaceId === 'string' ? data.workspaceId : undefined;

    if (!isDefined(workspaceId)) {
      throw new ServerWebhookTriggerException(
        'Resolver logic function must return { workspaceId: string; payload?: object }',
        ServerWebhookTriggerExceptionCode.RESOLVER_INVALID_RESULT,
      );
    }

    return {
      workspaceId,
      payload:
        typeof data.payload === 'object' && data.payload !== null
          ? (data.payload as object)
          : undefined,
    };
  }

  private async findCachedLogicFunction({
    workspaceId,
    universalIdentifier,
    requireServerWebhookTrigger = false,
  }: {
    workspaceId: string;
    universalIdentifier: string;
    requireServerWebhookTrigger?: boolean;
  }): Promise<FlatLogicFunction | undefined> {
    try {
      const { flatLogicFunctionMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatLogicFunctionMaps',
        ]);

      return Object.values(flatLogicFunctionMaps.byUniversalIdentifier).find(
        (logicFunction) =>
          isDefined(logicFunction) &&
          logicFunction.universalIdentifier === universalIdentifier &&
          !isDefined(logicFunction.deletedAt) &&
          (!requireServerWebhookTrigger ||
            isDefined(logicFunction.serverWebhookTriggerSettings)),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to resolve ${universalIdentifier} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return undefined;
    }
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
      throw new ServerWebhookTriggerException(
        error instanceof Error ? error.message : String(error),
        this.mapExecutorErrorToWebhookCode(error),
      );
    }
  }

  private mapExecutorErrorToWebhookCode(
    error: unknown,
  ): ServerWebhookTriggerExceptionCode {
    if (
      error instanceof LogicFunctionExecutionException &&
      error.code ===
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND
    ) {
      return ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND;
    }

    return ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_PLATFORM_ERROR;
  }
}
