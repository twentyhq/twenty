import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { type IngressTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { validate as uuidValidate } from 'uuid';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  IngressTriggerException,
  IngressTriggerExceptionCode,
} from 'src/engine/core-modules/ingress-trigger/exceptions/ingress-trigger.exception';
import { resolveWorkspaceIdFromRequest } from 'src/engine/core-modules/ingress-trigger/utils/resolve-workspace-id-from-request.util';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const WEBHOOK_WORKSPACE_ID_SOURCES = new Set(['body', 'query', 'header']);

@Injectable()
export class IngressTriggerService {
  private readonly logger = new Logger(IngressTriggerService.name);

  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly logicFunctionTriggerService: LogicFunctionTriggerService,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  private getIngressTriggerSettingsOrThrow(
    settings: IngressTriggerSettings | undefined,
  ): IngressTriggerSettings {
    const resolver = settings?.workspaceIdResolver;

    if (
      !isDefined(resolver) ||
      !WEBHOOK_WORKSPACE_ID_SOURCES.has(resolver.source) ||
      typeof resolver.path !== 'string' ||
      resolver.path.length === 0
    ) {
      throw new IngressTriggerException(
        'Ingress trigger is not configured for this logic function',
        IngressTriggerExceptionCode.INGRESS_TRIGGER_NOT_CONFIGURED,
      );
    }

    return settings as IngressTriggerSettings;
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
      throw new IngressTriggerException(
        `Application registration ${applicationRegistrationUniversalIdentifier} not found`,
        IngressTriggerExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    const logicFunctionManifest =
      applicationRegistration.manifest?.logicFunctions?.find(
        (candidate) =>
          candidate.universalIdentifier === logicFunctionUniversalIdentifier,
      );

    const ingressTriggerSettings = this.getIngressTriggerSettingsOrThrow(
      logicFunctionManifest?.ingressTriggerSettings,
    );

    const workspaceId = resolveWorkspaceIdFromRequest({
      resolver: ingressTriggerSettings.workspaceIdResolver,
      request,
    });

    if (!isDefined(workspaceId) || !uuidValidate(workspaceId)) {
      throw new IngressTriggerException(
        'Could not resolve a valid workspaceId from the webhook payload',
        IngressTriggerExceptionCode.WORKSPACE_ID_NOT_RESOLVED,
      );
    }

    const application = await this.applicationRepository.findOne({
      where: {
        workspaceId,
        applicationRegistrationId: applicationRegistration.id,
      },
    });

    if (!isDefined(application)) {
      throw new IngressTriggerException(
        `Application is not installed in workspace ${workspaceId} for this registration`,
        IngressTriggerExceptionCode.APPLICATION_NOT_INSTALLED,
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
      throw new IngressTriggerException(
        `Logic function ${logicFunctionUniversalIdentifier} is not installed in workspace ${workspaceId}`,
        IngressTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    let outcome;

    try {
      outcome = await this.logicFunctionTriggerService.run({
        logicFunction,
        request,
        pathParameters: {},
        forwardedRequestHeaders:
          ingressTriggerSettings.forwardedRequestHeaders ?? [],
        userId: null,
        userWorkspaceId: null,
      });
    } catch (error) {
      if (error instanceof IngressTriggerException) {
        throw error;
      }

      this.logger.error(
        `Unexpected error executing logic function ${logicFunction.id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new IngressTriggerException(
        `Logic function execution failed for ${logicFunction.id}`,
        this.mapErrorToWebhookCode(error),
      );
    }

    if (outcome.kind === 'userError') {
      throw new IngressTriggerException(
        outcome.errorMessage,
        IngressTriggerExceptionCode.INGRESS_USER_UNCAUGHT_ERROR,
      );
    }

    return outcome.response;
  }

  private mapErrorToWebhookCode(error: unknown): IngressTriggerExceptionCode {
    if (
      error instanceof LogicFunctionExecutionException &&
      error.code ===
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND
    ) {
      return IngressTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND;
    }

    return IngressTriggerExceptionCode.INGRESS_PLATFORM_ERROR;
  }
}
