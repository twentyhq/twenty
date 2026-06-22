import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { buildLogicFunctionEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import {
  type RouteTriggerResponse,
  buildRouteTriggerResponse,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import {
  ServerLogicFunctionExecutorException,
  ServerLogicFunctionExecutorExceptionCode,
} from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.exception';
import { isServerLogicFunctionResult } from 'src/engine/core-modules/server-logic-function-executor/utils/is-server-logic-function-result.util';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export type ServerLogicFunctionOutcome =
  | { kind: 'response'; workspaceIds: string[]; response: RouteTriggerResponse }
  | { kind: 'userError'; errorMessage: string };

const THROTTLE_LIMIT = 1000;
const THROTTLE_TTL_MS = 60_000;

@Injectable()
export class ServerLogicFunctionExecutorService {
  private readonly logger = new Logger(ServerLogicFunctionExecutorService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly registrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationRegistrationLogicFunctionEntity)
    private readonly registrationLogicFunctionRepository: Repository<ApplicationRegistrationLogicFunctionEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async run({
    applicationRegistrationUniversalIdentifier,
    logicFunctionUniversalIdentifier,
    payload,
    request,
  }: {
    applicationRegistrationUniversalIdentifier: string;
    logicFunctionUniversalIdentifier: string;
    payload?: object;
    request?: Request;
  }): Promise<ServerLogicFunctionOutcome> {
    if (!this.twentyConfigService.get('IS_SERVER_LOGIC_FUNCTION_ENABLED')) {
      throw new ServerLogicFunctionExecutorException(
        'Server logic functions are disabled on this instance',
        ServerLogicFunctionExecutorExceptionCode.FEATURE_DISABLED,
      );
    }

    const registration = await this.registrationRepository.findOne({
      where: {
        universalIdentifier: applicationRegistrationUniversalIdentifier,
      },
    });

    if (!isDefined(registration)) {
      throw new ServerLogicFunctionExecutorException(
        'Application registration not found',
        ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    if (!isDefined(registration.ownerWorkspaceId)) {
      throw new ServerLogicFunctionExecutorException(
        'Application registration has no owner workspace',
        ServerLogicFunctionExecutorExceptionCode.OWNER_WORKSPACE_NOT_SET,
      );
    }

    const serverFunction =
      await this.registrationLogicFunctionRepository.findOne({
        where: {
          applicationRegistrationId: registration.id,
          universalIdentifier: logicFunctionUniversalIdentifier,
          deletedAt: IsNull(),
        },
      });

    if (!isDefined(serverFunction)) {
      throw new ServerLogicFunctionExecutorException(
        'Server logic function not found',
        ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    if (isDefined(serverFunction.disabledAt)) {
      throw new ServerLogicFunctionExecutorException(
        'Server logic function is disabled',
        ServerLogicFunctionExecutorExceptionCode.FUNCTION_DISABLED,
      );
    }

    await this.throttle(registration.id);

    const application = await this.applicationRepository.findOne({
      where: {
        applicationRegistrationId: registration.id,
        workspaceId: registration.ownerWorkspaceId,
      },
    });

    if (!isDefined(application)) {
      throw new ServerLogicFunctionExecutorException(
        'Application is not installed in the owner workspace',
        ServerLogicFunctionExecutorExceptionCode.APP_NOT_INSTALLED_IN_OWNER_WORKSPACE,
      );
    }

    const ownerLogicFunction = await this.logicFunctionRepository.findOne({
      where: {
        workspaceId: registration.ownerWorkspaceId,
        applicationId: application.id,
        universalIdentifier: logicFunctionUniversalIdentifier,
      },
    });

    if (!isDefined(ownerLogicFunction)) {
      throw new ServerLogicFunctionExecutorException(
        'Owner-workspace copy of the logic function not found',
        ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const executionPayload = isDefined(request)
      ? buildLogicFunctionEvent({
          request,
          pathParameters: {},
          forwardedRequestHeaders:
            serverFunction.serverWebhookTriggerSettings
              ?.forwardedRequestHeaders ?? [],
          userWorkspaceId: null,
        })
      : (payload ?? {});

    let result;

    try {
      result = await this.logicFunctionExecutorService.execute({
        logicFunctionId: ownerLogicFunction.id,
        workspaceId: registration.ownerWorkspaceId,
        payload: executionPayload,
      });
    } catch (error) {
      this.logger.error(
        `Server logic function ${serverFunction.id} failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServerLogicFunctionExecutorException(
        'Server logic function execution failed',
        ServerLogicFunctionExecutorExceptionCode.PLATFORM_ERROR,
      );
    }

    if (isDefined(result.error)) {
      return { kind: 'userError', errorMessage: result.error.errorMessage };
    }

    if (!isServerLogicFunctionResult(result.data)) {
      throw new ServerLogicFunctionExecutorException(
        'Server logic function must return { workspaceIds: string[]; response? }',
        ServerLogicFunctionExecutorExceptionCode.INVALID_RETURN_SHAPE,
      );
    }

    return {
      kind: 'response',
      workspaceIds: result.data.workspaceIds,
      response: buildRouteTriggerResponse(result.data.response),
    };
  }

  private async throttle(applicationRegistrationId: string): Promise<void> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `${applicationRegistrationId}-server-logic-function-execution`,
        1,
        THROTTLE_LIMIT,
        THROTTLE_TTL_MS,
      );
    } catch {
      throw new ServerLogicFunctionExecutorException(
        'Server logic function execution rate limit exceeded',
        ServerLogicFunctionExecutorExceptionCode.THROTTLED,
      );
    }
  }
}
