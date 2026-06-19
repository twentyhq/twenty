import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { type ServerWebhookTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { validate as uuidValidate } from 'uuid';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ServerWebhookTriggerException,
  ServerWebhookTriggerExceptionCode,
} from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { resolveWorkspaceIdFromRequest } from 'src/engine/core-modules/server-webhook-trigger/utils/resolve-workspace-id-from-request.util';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const WEBHOOK_WORKSPACE_ID_SOURCES = new Set(['body', 'query', 'header']);

@Injectable()
export class ServerWebhookTriggerService {
  private readonly logger = new Logger(ServerWebhookTriggerService.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly logicFunctionTriggerService: LogicFunctionTriggerService,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  private getServerWebhookTriggerSettingsOrThrow(
    settings: ServerWebhookTriggerSettings | undefined,
  ): ServerWebhookTriggerSettings {
    const resolver = settings?.workspaceIdResolver;

    if (
      !isDefined(resolver) ||
      !WEBHOOK_WORKSPACE_ID_SOURCES.has(resolver.source) ||
      typeof resolver.path !== 'string' ||
      resolver.path.length === 0
    ) {
      throw new ServerWebhookTriggerException(
        'Server webhook trigger is not configured for this logic function',
        ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_TRIGGER_NOT_CONFIGURED,
      );
    }

    return settings as ServerWebhookTriggerSettings;
  }

  async handle({
    request,
    applicationRegistrationUniversalIdentifier,
    logicFunctionUniversalIdentifier,
  }: {
    request: Request;
    applicationRegistrationUniversalIdentifier: string;
    logicFunctionUniversalIdentifier: string;
  }): Promise<RouteTriggerResponse> {
    const applicationRegistration =
      await this.applicationRegistrationService.findOneByUniversalIdentifier(
        applicationRegistrationUniversalIdentifier,
      );

    if (!isDefined(applicationRegistration)) {
      throw new ServerWebhookTriggerException(
        `Application registration ${applicationRegistrationUniversalIdentifier} not found`,
        ServerWebhookTriggerExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    const logicFunctionManifest =
      applicationRegistration.manifest?.logicFunctions?.find(
        (candidate) =>
          candidate.universalIdentifier === logicFunctionUniversalIdentifier,
      );

    const serverWebhookTriggerSettings =
      this.getServerWebhookTriggerSettingsOrThrow(
        logicFunctionManifest?.serverWebhookTriggerSettings,
      );

    const workspaceId = resolveWorkspaceIdFromRequest({
      resolver: serverWebhookTriggerSettings.workspaceIdResolver,
      request,
    });

    if (!isDefined(workspaceId) || !uuidValidate(workspaceId)) {
      throw new ServerWebhookTriggerException(
        'Could not resolve a valid workspaceId from the webhook payload',
        ServerWebhookTriggerExceptionCode.WORKSPACE_ID_NOT_RESOLVED,
      );
    }

    const application = await this.applicationRepository.findOne({
      where: {
        workspaceId,
        applicationRegistrationId: applicationRegistration.id,
      },
    });

    if (!isDefined(application)) {
      throw new ServerWebhookTriggerException(
        `Application is not installed in workspace ${workspaceId} for this registration`,
        ServerWebhookTriggerExceptionCode.APPLICATION_NOT_INSTALLED,
      );
    }

    const logicFunction = await this.logicFunctionRepository.findOne({
      where: {
        workspaceId,
        applicationId: application.id,
        universalIdentifier: logicFunctionUniversalIdentifier,
      },
    });

    if (!isDefined(logicFunction)) {
      throw new ServerWebhookTriggerException(
        `Logic function ${logicFunctionUniversalIdentifier} is not installed in workspace ${workspaceId}`,
        ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    let outcome;

    try {
      outcome = await this.logicFunctionTriggerService.run({
        logicFunction,
        request,
        pathParameters: {},
        forwardedRequestHeaders:
          serverWebhookTriggerSettings.forwardedRequestHeaders ?? [],
        userId: null,
        userWorkspaceId: null,
      });
    } catch (error) {
      if (error instanceof ServerWebhookTriggerException) {
        throw error;
      }

      this.logger.error(
        `Unexpected error executing logic function ${logicFunction.id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new ServerWebhookTriggerException(
        `Logic function execution failed for ${logicFunction.id}`,
        this.mapErrorToWebhookCode(error),
      );
    }

    if (outcome.kind === 'userError') {
      throw new ServerWebhookTriggerException(
        outcome.errorMessage,
        ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
      );
    }

    return outcome.response;
  }

  private mapErrorToWebhookCode(
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
