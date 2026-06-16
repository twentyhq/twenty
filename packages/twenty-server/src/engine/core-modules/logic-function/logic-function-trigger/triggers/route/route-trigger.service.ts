import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Request } from 'express';
import { match } from 'path-to-regexp';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Raw, Repository, type FindOperator } from 'typeorm';
import { HTTPMethod, isLogicFunctionHttpResponse } from 'twenty-shared/types';
import { type SharedWebhookIngressSettings } from 'twenty-shared/application';
import { validate as isValidUuid } from 'uuid';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/exceptions/route-trigger.exception';
import {
  buildLogicFunctionEvent,
  extractBody,
  extractRawBody,
  filterRequestHeaders,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import { extractSharedWebhookTenantIdFromBody } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/extract-shared-webhook-tenant-id-from-body.util';
import { verifySvixWebhookSignature } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/verify-svix-webhook-signature.util';
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
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CustomException } from 'src/utils/custom-exception';

export type RouteTriggerResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
};

type RouteTriggerMatchedResolution = {
  status: 'matched';
  logicFunction: LogicFunctionEntity;
  pathParams: Partial<Record<string, string | string[]>>;
};

type RouteTriggerSkippedResolution = {
  status: 'skipped';
  response: RouteTriggerResponse;
};

type RouteTriggerResolution =
  | RouteTriggerMatchedResolution
  | RouteTriggerSkippedResolution;

type SharedWebhookIngressCandidate = {
  logicFunction: LogicFunctionEntity;
  pathParams: Partial<Record<string, string | string[]>>;
  sharedWebhookIngress: SharedWebhookIngressSettings;
  applicationRegistrationId: string;
};

export const buildRouteTriggerResponse = (
  data: unknown,
): RouteTriggerResponse => {
  if (isLogicFunctionHttpResponse(data)) {
    return {
      statusCode: data.status ?? 200,
      headers: data.headers ?? {},
      body: data.body,
    };
  }

  return { statusCode: 200, headers: {}, body: data };
};

const buildSkippedRouteTriggerResponse = (
  reason: string,
): RouteTriggerResponse => ({
  statusCode: 200,
  headers: {},
  body: {
    status: 'skipped',
    reason,
  },
});

@Injectable()
export class RouteTriggerService {
  private readonly logger = new Logger(RouteTriggerService.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  private getRequestPath(request: Request): string {
    return request.path.replace(/^\/s\//, '/');
  }

  private getSharedWebhookIngressHttpRouteTriggerSettingsWhere({
    httpMethod,
  }: {
    httpMethod: HTTPMethod;
  }): FindOperator<unknown> {
    return Raw(
      (httpRouteTriggerSettingsAlias) =>
        `${httpRouteTriggerSettingsAlias}->>'httpMethod' = :httpMethod AND ${httpRouteTriggerSettingsAlias}->'sharedWebhookIngress' IS NOT NULL`,
      { httpMethod },
    );
  }

  private findMatchingLogicFunctionWithPathParams({
    logicFunctionsWithHttpRouteTrigger,
    request,
    httpMethod,
    sharedWebhookIngressApplicationRegistrationId,
  }: {
    logicFunctionsWithHttpRouteTrigger: LogicFunctionEntity[];
    request: Request;
    httpMethod: HTTPMethod;
    sharedWebhookIngressApplicationRegistrationId?: string;
  }):
    | {
        logicFunction: LogicFunctionEntity;
        pathParams: Partial<Record<string, string | string[]>>;
      }
    | undefined {
    const requestPath = this.getRequestPath(request);

    for (const logicFunction of logicFunctionsWithHttpRouteTrigger) {
      const httpRouteSettings = logicFunction.httpRouteTriggerSettings;

      if (
        !isDefined(httpRouteSettings) ||
        httpRouteSettings.httpMethod !== httpMethod
      ) {
        continue;
      }

      if (
        isDefined(sharedWebhookIngressApplicationRegistrationId) &&
        (!isDefined(httpRouteSettings.sharedWebhookIngress) ||
          logicFunction.application?.applicationRegistrationId !==
            sharedWebhookIngressApplicationRegistrationId)
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

    return undefined;
  }

  private findSharedWebhookIngressCandidate({
    logicFunction,
    request,
    httpMethod,
  }: {
    logicFunction: LogicFunctionEntity;
    request: Request;
    httpMethod: HTTPMethod;
  }): SharedWebhookIngressCandidate | undefined {
    const httpRouteSettings = logicFunction.httpRouteTriggerSettings;

    if (
      !isDefined(httpRouteSettings) ||
      httpRouteSettings.httpMethod !== httpMethod ||
      !isDefined(httpRouteSettings.sharedWebhookIngress)
    ) {
      return undefined;
    }

    const applicationRegistrationId =
      logicFunction.application?.applicationRegistrationId;

    if (!isDefined(applicationRegistrationId)) {
      return undefined;
    }

    const routeMatcher = match(httpRouteSettings.path, {
      decode: decodeURIComponent,
    });
    const routeMatched = routeMatcher(this.getRequestPath(request));

    if (!routeMatched) {
      return undefined;
    }

    return {
      logicFunction,
      pathParams: routeMatched.params,
      sharedWebhookIngress: httpRouteSettings.sharedWebhookIngress,
      applicationRegistrationId,
    };
  }

  private async getSharedWebhookIngressCandidates({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<SharedWebhookIngressCandidate[]> {
    const logicFunctionsWithHttpRouteTrigger =
      await this.logicFunctionRepository.find({
        where: {
          httpRouteTriggerSettings:
            this.getSharedWebhookIngressHttpRouteTriggerSettingsWhere({
              httpMethod,
            }),
        },
        relations: {
          application: true,
        },
      });

    return logicFunctionsWithHttpRouteTrigger.flatMap((logicFunction) => {
      const sharedWebhookIngressCandidate =
        this.findSharedWebhookIngressCandidate({
          logicFunction,
          request,
          httpMethod,
        });

      return isDefined(sharedWebhookIngressCandidate)
        ? [sharedWebhookIngressCandidate]
        : [];
    });
  }

  private async getApplicationRegistrationVariableValue({
    applicationRegistrationId,
    variableName,
  }: {
    applicationRegistrationId: string;
    variableName: string;
  }): Promise<string | undefined> {
    const variable =
      await this.applicationRegistrationVariableRepository.findOne({
        where: {
          applicationRegistrationId,
          key: variableName,
        },
      });

    if (!isDefined(variable) || variable.encryptedValue === '') {
      return undefined;
    }

    return this.secretEncryptionService.decryptVersioned(
      variable.encryptedValue,
    );
  }

  private async getVerifiedSharedWebhookIngressCandidates({
    request,
    candidates,
  }: {
    request: Request;
    candidates: SharedWebhookIngressCandidate[];
  }): Promise<SharedWebhookIngressCandidate[]> {
    const rawBody = extractRawBody(request);

    if (!isDefined(rawBody)) {
      throw new RouteTriggerException(
        'Raw request body was not forwarded by the server; cannot verify webhook signature',
        RouteTriggerExceptionCode.LOGIC_FUNCTION_EXECUTION_ERROR,
      );
    }

    const headers = filterRequestHeaders({
      requestHeaders: request.headers,
      forwardedRequestHeaders: [
        'webhook-id',
        'webhook-timestamp',
        'webhook-signature',
        'svix-id',
        'svix-timestamp',
        'svix-signature',
      ],
    });
    let didFindConfiguredSecret = false;
    const secretByApplicationRegistrationAndVariableName = new Map<
      string,
      string | undefined
    >();
    const verifiedSharedWebhookIngressCandidates: SharedWebhookIngressCandidate[] =
      [];

    for (const candidate of candidates) {
      const signatureVerification =
        candidate.sharedWebhookIngress.signatureVerification;
      const secretVariableName =
        signatureVerification.secretApplicationRegistrationVariableName;
      const secretCacheKey = `${candidate.applicationRegistrationId}:${secretVariableName}`;
      const cachedSecret =
        secretByApplicationRegistrationAndVariableName.get(secretCacheKey);
      const secret = secretByApplicationRegistrationAndVariableName.has(
        secretCacheKey,
      )
        ? cachedSecret
        : await this.getApplicationRegistrationVariableValue({
            applicationRegistrationId: candidate.applicationRegistrationId,
            variableName: secretVariableName,
          });

      if (!secretByApplicationRegistrationAndVariableName.has(secretCacheKey)) {
        secretByApplicationRegistrationAndVariableName.set(
          secretCacheKey,
          secret,
        );
      }

      if (!isNonEmptyString(secret)) {
        continue;
      }

      didFindConfiguredSecret = true;

      const signatureCheck = verifySvixWebhookSignature({
        rawBody,
        headers,
        secret,
      });

      if (signatureCheck.valid) {
        verifiedSharedWebhookIngressCandidates.push(candidate);
      }
    }

    if (verifiedSharedWebhookIngressCandidates.length > 0) {
      return verifiedSharedWebhookIngressCandidates;
    }

    if (!didFindConfiguredSecret) {
      throw new RouteTriggerException(
        'Shared webhook signature secret is not configured',
        RouteTriggerExceptionCode.LOGIC_FUNCTION_EXECUTION_ERROR,
      );
    }

    throw new RouteTriggerException(
      'Shared webhook signature verification failed',
      RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }

  private async getLogicFunctionFromVerifiedSharedWebhookIngressCandidate({
    request,
    httpMethod,
    verifiedSharedWebhookIngressCandidate,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
    verifiedSharedWebhookIngressCandidate: SharedWebhookIngressCandidate;
  }): Promise<RouteTriggerResolution> {
    const tenantId = extractSharedWebhookTenantIdFromBody({
      body: extractBody(request),
      tenantIdPaths:
        verifiedSharedWebhookIngressCandidate.sharedWebhookIngress
          .tenantIdPaths,
    });

    if (!isNonEmptyString(tenantId) || !isValidUuid(tenantId)) {
      return {
        status: 'skipped',
        response: buildSkippedRouteTriggerResponse(
          'shared webhook tenant id not found',
        ),
      };
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: tenantId,
    });

    if (!isDefined(workspace)) {
      return {
        status: 'skipped',
        response: buildSkippedRouteTriggerResponse('workspace not found'),
      };
    }

    const logicFunctionsWithHttpRouteTrigger =
      await this.logicFunctionRepository.find({
        where: {
          workspaceId: workspace.id,
          httpRouteTriggerSettings:
            this.getSharedWebhookIngressHttpRouteTriggerSettingsWhere({
              httpMethod,
            }),
        },
        relations: {
          application: true,
        },
      });

    const matchingLogicFunctionWithPathParams =
      this.findMatchingLogicFunctionWithPathParams({
        logicFunctionsWithHttpRouteTrigger,
        request,
        httpMethod,
        sharedWebhookIngressApplicationRegistrationId:
          verifiedSharedWebhookIngressCandidate.applicationRegistrationId,
      });

    if (!isDefined(matchingLogicFunctionWithPathParams)) {
      return {
        status: 'skipped',
        response: buildSkippedRouteTriggerResponse(
          'shared webhook ingress trigger not found',
        ),
      };
    }

    return {
      status: 'matched',
      ...matchingLogicFunctionWithPathParams,
    };
  }

  private async getLogicFunctionFromSharedWebhookIngress({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<RouteTriggerResolution> {
    const sharedWebhookIngressCandidates =
      await this.getSharedWebhookIngressCandidates({
        request,
        httpMethod,
      });

    if (sharedWebhookIngressCandidates.length === 0) {
      throw new RouteTriggerException(
        'No Route trigger found',
        RouteTriggerExceptionCode.TRIGGER_NOT_FOUND,
      );
    }

    const verifiedSharedWebhookIngressCandidates =
      await this.getVerifiedSharedWebhookIngressCandidates({
        request,
        candidates: sharedWebhookIngressCandidates,
      });

    let skippedRouteTriggerResponse: RouteTriggerResponse | undefined;

    for (const verifiedSharedWebhookIngressCandidate of verifiedSharedWebhookIngressCandidates) {
      const routeTriggerResolution =
        await this.getLogicFunctionFromVerifiedSharedWebhookIngressCandidate({
          request,
          httpMethod,
          verifiedSharedWebhookIngressCandidate,
        });

      if (routeTriggerResolution.status === 'matched') {
        return routeTriggerResolution;
      }

      skippedRouteTriggerResponse ??= routeTriggerResolution.response;
    }

    return {
      status: 'skipped',
      response:
        skippedRouteTriggerResponse ??
        buildSkippedRouteTriggerResponse(
          'shared webhook ingress trigger not found',
        ),
    };
  }

  private async getLogicFunctionWithPathParamsOrFail({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<RouteTriggerResolution> {
    const host = `${request.protocol}://${request.get('host')}`;

    const { workspace, publicDomain } =
      await this.workspaceDomainsService.resolveWorkspaceAndPublicDomain(host);

    if (!isDefined(workspace)) {
      return this.getLogicFunctionFromSharedWebhookIngress({
        request,
        httpMethod,
      });
    }

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

    const matchingLogicFunctionWithPathParams =
      this.findMatchingLogicFunctionWithPathParams({
        logicFunctionsWithHttpRouteTrigger,
        request,
        httpMethod,
      });

    if (isDefined(matchingLogicFunctionWithPathParams)) {
      return {
        status: 'matched',
        ...matchingLogicFunctionWithPathParams,
      };
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
    const routeTriggerResolution =
      await this.getLogicFunctionWithPathParamsOrFail({
        request,
        httpMethod,
      });

    if (routeTriggerResolution.status === 'skipped') {
      return routeTriggerResolution.response;
    }

    const { logicFunction, pathParams } = routeTriggerResolution;

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
      return buildRouteTriggerResponse(result);
    }

    if (result.error) {
      throw new RouteTriggerException(
        result.error.errorMessage,
        RouteTriggerExceptionCode.LOGIC_FUNCTION_EXECUTION_ERROR,
      );
    }

    return buildRouteTriggerResponse(result.data);
  }
}
