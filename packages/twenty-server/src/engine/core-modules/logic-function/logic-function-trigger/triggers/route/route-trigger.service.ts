import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Request } from 'express';
import { match } from 'path-to-regexp';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';
import { HTTPMethod } from 'twenty-shared/types';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';
import { LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
export class RouteTriggerService {
  private readonly logger = new Logger(RouteTriggerService.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly logicFunctionTriggerService: LogicFunctionTriggerService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
  ) {}

  private async getLogicFunctionWithPathParamsOrFail({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<{
    logicFunction: LogicFunctionEntity;
    pathParams: Partial<Record<string, string | string[]>>;
    isIsolatedOrigin: boolean;
  }> {
    const host = `${request.protocol}://${request.get('host')}`;

    const { workspace, publicDomain, isIsolatedOrigin } =
      await this.workspaceDomainsService.resolveWorkspaceAndPublicDomain(host);

    assertIsDefinedOrThrow(
      workspace,
      new RouteTriggerException(
        'Workspace not found',
        RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    // App-scoped public domain → restrict matches to that app's logic functions.
    const applicationId = publicDomain?.applicationId ?? null;

    const logicFunctionsWithHttpRouteTrigger =
      await this.logicFunctionRepository.find({
        where: {
          workspaceId: workspace.id,
          httpRouteTriggerSettings: Not(IsNull()),
          ...(isDefined(applicationId) ? { applicationId } : {}),
        },
      });

    const requestPath = request.path.replace(/^\/s\//, '/');

    for (const logicFunction of logicFunctionsWithHttpRouteTrigger) {
      const httpRouteSettings = logicFunction.httpRouteTriggerSettings;

      if (
        !isDefined(httpRouteSettings) ||
        httpRouteSettings.httpMethod !== httpMethod
      ) {
        continue;
      }

      const routeMatcher = match(httpRouteSettings.path, {
        decode: decodeURIComponent,
      });
      const routeMatched = routeMatcher(requestPath);

      if (routeMatched) {
        this.assertLegacyRouteIsServableOrThrow({
          logicFunction,
          workspace,
          isIsolatedOrigin,
        });

        return {
          logicFunction,
          pathParams: routeMatched.params,
          isIsolatedOrigin,
        };
      }
    }

    throw new RouteTriggerException(
      'No Route trigger found',
      RouteTriggerExceptionCode.TRIGGER_NOT_FOUND,
    );
  }

  private assertLegacyRouteIsServableOrThrow({
    logicFunction,
    workspace,
    isIsolatedOrigin,
  }: {
    logicFunction: LogicFunctionEntity;
    workspace: WorkspaceEntity;
    isIsolatedOrigin: boolean;
  }) {
    if (isIsolatedOrigin) {
      return;
    }

    const cutoffIso = this.twentyConfigService.get(
      'LOGIC_FUNCTION_LEGACY_ROUTE_CUTOFF',
    );

    if (!isNonEmptyString(cutoffIso)) {
      return;
    }

    const publicFunctionUrl =
      this.workspaceDomainsService.buildPublicFunctionUrl({
        workspace,
        path: logicFunction.httpRouteTriggerSettings?.path ?? '/',
      });

    if (!isDefined(publicFunctionUrl)) {
      return;
    }

    const cutoffDate = new Date(cutoffIso);

    if (Number.isNaN(cutoffDate.getTime())) {
      return;
    }

    if (logicFunction.createdAt.getTime() >= cutoffDate.getTime()) {
      this.logger.warn(
        `Logic function ${logicFunction.id} was requested on the deprecated /s/ route but is only served on ${publicFunctionUrl}`,
      );

      throw new RouteTriggerException(
        `Logic function ${logicFunction.id} is no longer served on the legacy /s/ route`,
        RouteTriggerExceptionCode.LEGACY_ROUTE_DEPRECATED,
        {
          userFriendlyMessage: msg`This endpoint has moved. Call it at ${publicFunctionUrl} instead.`,
        },
      );
    }
  }

  private async validateWorkspaceFromRequest({
    request,
    workspaceId,
  }: {
    request: Request;
    workspaceId: string;
  }) {
    const authContext =
      await this.accessTokenService.validateTokenByRequest(request);

    if (!isDefined(authContext.workspace)) {
      throw new RouteTriggerException(
        'Workspace not found',
        RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    if (authContext.workspace.id !== workspaceId) {
      throw new RouteTriggerException(
        'You are not authorized',
        RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return authContext;
  }

  private mapErrorToRouteTriggerCode(
    error: unknown,
  ): RouteTriggerExceptionCode {
    if (error instanceof LogicFunctionExecutionException) {
      switch (error.code) {
        case LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
          return RouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND;
        case LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED:
          return RouteTriggerExceptionCode.RATE_LIMIT_EXCEEDED;
      }
    }

    if (error instanceof LogicFunctionException) {
      switch (error.code) {
        case LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
          return RouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND;
        case LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED:
          return RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION;
      }
    }

    return RouteTriggerExceptionCode.ROUTE_TRIGGER_PLATFORM_ERROR;
  }

  async handle({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<{ response: RouteTriggerResponse; isIsolatedOrigin: boolean }> {
    const { logicFunction, pathParams, isIsolatedOrigin } =
      await this.getLogicFunctionWithPathParamsOrFail({
        request,
        httpMethod,
      });

    const httpRouteSettings = logicFunction.httpRouteTriggerSettings;

    let userWorkspaceId: string | null = null;
    let userId: string | null = null;

    if (httpRouteSettings?.isAuthRequired) {
      const authContext = await this.validateWorkspaceFromRequest({
        request,
        workspaceId: logicFunction.workspaceId,
      });

      userWorkspaceId = authContext.userWorkspaceId ?? null;
      userId = authContext.user?.id ?? null;
    }

    let outcome;

    try {
      outcome = await this.logicFunctionTriggerService.run({
        logicFunction,
        request,
        pathParameters: pathParams,
        forwardedRequestHeaders:
          httpRouteSettings?.forwardedRequestHeaders ?? [],
        forwardAllHeaders: isIsolatedOrigin,
        userId,
        userWorkspaceId,
      });
    } catch (error) {
      if (error instanceof RouteTriggerException) {
        throw error;
      }

      this.logger.error(
        `Unexpected error executing logic function ${logicFunction.id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      const code = this.mapErrorToRouteTriggerCode(error);

      throw new RouteTriggerException(
        `Logic function execution failed for ${logicFunction.id}`,
        code,
        {
          userFriendlyMessage:
            error instanceof CustomException
              ? error.userFriendlyMessage
              : undefined,
        },
      );
    }

    if (outcome.kind === 'userError') {
      throw new RouteTriggerException(
        outcome.errorMessage,
        RouteTriggerExceptionCode.ROUTE_TRIGGER_USER_UNCAUGHT_ERROR,
      );
    }

    return { response: outcome.response, isIsolatedOrigin };
  }
}
