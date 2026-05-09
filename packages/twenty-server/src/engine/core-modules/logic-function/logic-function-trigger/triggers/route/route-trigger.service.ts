import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { match } from 'path-to-regexp';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';
import { HTTPMethod } from 'twenty-shared/types';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';
import { buildLogicFunctionEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
export class RouteTriggerService {
  private readonly logger = new Logger(RouteTriggerService.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
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
  }> {
    const host = `${request.protocol}://${request.get('host')}`;

    const { workspace, publicDomain } =
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
        return {
          logicFunction,
          pathParams: routeMatched.params,
        };
      }
    }

    throw new RouteTriggerException(
      'No Route trigger found',
      RouteTriggerExceptionCode.TRIGGER_NOT_FOUND,
    );
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

    if (
      error instanceof LogicFunctionException &&
      error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND
    ) {
      return RouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND;
    }

    return RouteTriggerExceptionCode.LOGIC_FUNCTION_EXECUTION_ERROR;
  }

  async handle({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }) {
    const { logicFunction, pathParams } =
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

    const event = buildLogicFunctionEvent({
      request,
      pathParameters: pathParams,
      forwardedRequestHeaders: httpRouteSettings?.forwardedRequestHeaders ?? [],
      userWorkspaceId,
    });

    let result;

    try {
      result = await this.logicFunctionExecutorService.execute({
        logicFunctionId: logicFunction.id,
        workspaceId: logicFunction.workspaceId,
        payload: event,
        ...(userId ? { userId } : {}),
        ...(userWorkspaceId ? { userWorkspaceId } : {}),
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

    if (!isDefined(result)) {
      return result;
    }

    if (result.error) {
      throw new RouteTriggerException(
        result.error.errorMessage,
        RouteTriggerExceptionCode.LOGIC_FUNCTION_EXECUTION_ERROR,
      );
    }

    return result.data;
  }
}
