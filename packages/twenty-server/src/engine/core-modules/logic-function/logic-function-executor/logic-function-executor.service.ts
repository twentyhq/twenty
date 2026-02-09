import { Inject, Injectable } from '@nestjs/common';

import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  LogicFunctionDriver,
  type LogicFunctionExecuteResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { LOGIC_FUNCTION_EXECUTED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/logic-function/logic-function-executed';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { buildEnvVar } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-env-var';
import { LOGIC_FUNCTION_DRIVER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver.constants';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { cleanServerUrl } from 'src/utils/clean-server-url';
import type { FlatApplicationVariable } from 'src/engine/core-modules/applicationVariable/types/flat-application-variable.type';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

const MIN_TOKEN_EXPIRATION_IN_SECONDS = 5;

export class LogicFunctionExecutionException extends Error {
  constructor(
    message: string,
    public readonly code: LogicFunctionExecutionExceptionCode,
  ) {
    super(message);
    this.name = 'LogicFunctionExecutionException';
  }
}

export enum LogicFunctionExecutionExceptionCode {
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

@Injectable()
export class LogicFunctionExecutorService {
  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER)
    private driver: LogicFunctionDriver,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly secretEncryptionService: SecretEncryptionService,
    private readonly subscriptionService: SubscriptionService,
    private readonly auditService: AuditService,
  ) {}

  async execute({
    logicFunctionId,
    workspaceId,
    payload,
  }: {
    logicFunctionId: string;
    workspaceId: string;
    payload: object;
  }): Promise<LogicFunctionExecuteResult> {
    await this.throttleExecution(workspaceId);

    const { flatApplication, flatLogicFunction, flatApplicationVariables } =
      await this.getFlatEntitiesOrThrow({
        workspaceId,
        logicFunctionId,
      });

    const envVariables = await this.getExecutionEnvVariables({
      workspaceId,
      flatApplication,
      flatApplicationVariables,
      flatLogicFunction,
    });

    const resultLogicFunction = await this.callWithTimeout({
      callback: () =>
        this.driver.execute({
          flatLogicFunction,
          flatApplication,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
          payload,
          env: envVariables,
        }),
      timeoutMs: flatLogicFunction.timeoutSeconds * 1000,
    });

    await this.handleExecutionResult({
      result: resultLogicFunction,
      flatApplication,
      flatLogicFunction,
      workspaceId,
    });

    return resultLogicFunction;
  }

  private async throttleExecution(workspaceId: string) {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `${workspaceId}-logic-function-execution`,
        1,
        this.twentyConfigService.get('LOGIC_FUNCTION_EXEC_THROTTLE_LIMIT'),
        this.twentyConfigService.get('LOGIC_FUNCTION_EXEC_THROTTLE_TTL'),
      );
    } catch {
      throw new LogicFunctionExecutionException(
        'Logic function execution rate limit exceeded',
        LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED,
      );
    }
  }

  private async callWithTimeout<T>({
    callback,
    timeoutMs,
  }: {
    callback: () => Promise<T>;
    timeoutMs: number;
  }): Promise<T> {
    return Promise.race([
      callback(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timed out')), timeoutMs),
      ),
    ]);
  }

  private async getFlatEntitiesOrThrow({
    workspaceId,
    logicFunctionId,
  }: {
    workspaceId: string;
    logicFunctionId: string;
  }) {
    const {
      flatLogicFunctionMaps,
      flatApplicationMaps,
      applicationVariableMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatLogicFunctionMaps',
      'flatApplicationMaps',
      'applicationVariableMaps',
    ]);

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    if (
      !isDefined(flatLogicFunction) ||
      isDefined(flatLogicFunction.deletedAt)
    ) {
      throw new LogicFunctionExecutionException(
        `Logic function with id ${logicFunctionId} not found`,
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const flatApplication = isDefined(flatLogicFunction.applicationId)
      ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
      : undefined;

    if (!isDefined(flatApplication)) {
      throw new LogicFunctionExecutionException(
        `Application not found for logic function ${logicFunctionId}`,
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const flatApplicationVariables =
      applicationVariableMaps.byApplicationId[flatApplication.id] ?? [];

    return { flatApplication, flatLogicFunction, flatApplicationVariables };
  }

  private async getExecutionEnvVariables({
    workspaceId,
    flatApplication,
    flatLogicFunction,
    flatApplicationVariables,
  }: {
    workspaceId: string;
    flatApplication: FlatApplication;
    flatLogicFunction: FlatLogicFunction;
    flatApplicationVariables: FlatApplicationVariable[];
  }) {
    const applicationAccessToken =
      await this.applicationTokenService.generateApplicationToken({
        workspaceId,
        applicationId: flatApplication.id,
        expiresInSeconds: Math.max(
          flatLogicFunction.timeoutSeconds,
          MIN_TOKEN_EXPIRATION_IN_SECONDS,
        ),
      });

    const baseUrl = cleanServerUrl(this.twentyConfigService.get('SERVER_URL'));

    return {
      [DEFAULT_API_URL_NAME]: baseUrl ?? '',
      [DEFAULT_API_KEY_NAME]: applicationAccessToken.token,
      ...buildEnvVar(flatApplicationVariables, this.secretEncryptionService),
    };
  }

  private async handleExecutionResult({
    result,
    flatApplication,
    flatLogicFunction,
    workspaceId,
  }: {
    result: LogicFunctionExecuteResult;
    workspaceId: string;
    flatLogicFunction: FlatLogicFunction;
    flatApplication: FlatApplication;
  }) {
    if (this.twentyConfigService.get('LOGIC_FUNCTION_LOGS_ENABLED')) {
      /* eslint-disable no-console */
      console.log(result.logs);
    }

    await this.subscriptionService.publish({
      channel: SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
      workspaceId,
      payload: {
        logicFunctionLogs: {
          logs: result.logs,
          id: flatLogicFunction.id,
          name: flatLogicFunction.name,
          universalIdentifier: flatLogicFunction.universalIdentifier,
          applicationId: flatApplication.id,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        },
      },
    });

    this.auditService
      .createContext({
        workspaceId,
      })
      .insertWorkspaceEvent(LOGIC_FUNCTION_EXECUTED_EVENT, {
        duration: result.duration,
        status: result.status,
        ...(result.error && {
          errorType: result.error.errorType,
        }),
        functionId: flatLogicFunction.id,
        functionName: flatLogicFunction.name,
      });
  }
}
