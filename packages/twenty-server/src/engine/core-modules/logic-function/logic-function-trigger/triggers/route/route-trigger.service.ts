import { Injectable } from '@nestjs/common';
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
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

@Injectable()
export class RouteTriggerService {
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

    const workspace =
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        host,
      );

    assertIsDefinedOrThrow(
      workspace,
      new RouteTriggerException(
        'Workspace not found',
        RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const logicFunctionsWithHttpRouteTrigger =
      await this.logicFunctionRepository.find({
        where: {
          workspaceId: workspace.id,
          httpRouteTriggerSettings: Not(IsNull()),
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

    if (httpRouteSettings?.isAuthRequired) {
      await this.validateWorkspaceFromRequest({
        request,
        workspaceId: logicFunction.workspaceId,
      });
    }

    const event = buildLogicFunctionEvent({
      request,
      pathParameters: pathParams,
      forwardedRequestHeaders: httpRouteSettings?.forwardedRequestHeaders ?? [],
    });

    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: logicFunction.id,
      workspaceId: logicFunction.workspaceId,
      payload: event,
    });

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
