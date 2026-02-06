import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  LogicFunctionExecutorDriver,
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-executor-driver.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { LOGIC_FUNCTION_EXECUTED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/logic-function/logic-function-executed';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { buildEnvVar } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/build-env-var';
import { LOGIC_FUNCTION_EXECUTOR_DRIVER } from 'src/engine/core-modules/logic-function/logic-function-executor/constants/logic-function-executor.constants';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { cleanServerUrl } from 'src/utils/clean-server-url';

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
export class LogicFunctionExecutorService
  implements LogicFunctionExecutorDriver
{
  constructor(
    @Inject(LOGIC_FUNCTION_EXECUTOR_DRIVER)
    private driver: LogicFunctionExecutorDriver,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly secretEncryptionService: SecretEncryptionService,
    private readonly subscriptionService: SubscriptionService,
    private readonly auditService: AuditService,
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
  ) {}

  async delete(flatLogicFunction: FlatLogicFunction): Promise<void> {
    return this.driver.delete(flatLogicFunction);
  }

  async execute(
    params: LogicFunctionExecuteParams,
  ): Promise<LogicFunctionExecuteResult> {
    return this.driver.execute(params);
  }

  async executeOneLogicFunction({
    id,
    workspaceId,
    payload,
  }: {
    id: string;
    workspaceId: string;
    payload: object;
  }): Promise<LogicFunctionExecuteResult> {
    await this.throttleExecution(workspaceId);

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
      flatEntityId: id,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    if (
      !isDefined(flatLogicFunction) ||
      isDefined(flatLogicFunction.deletedAt)
    ) {
      throw new LogicFunctionExecutionException(
        `Logic function with id ${id} not found`,
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const flatApplication = isDefined(flatLogicFunction.applicationId)
      ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
      : undefined;

    if (!isDefined(flatApplication)) {
      throw new LogicFunctionExecutionException(
        `Application not found for logic function ${id}`,
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const applicationAccessToken = isDefined(flatLogicFunction.applicationId)
      ? await this.applicationTokenService.generateApplicationToken({
          workspaceId,
          applicationId: flatLogicFunction.applicationId,
          expiresInSeconds: Math.max(
            flatLogicFunction.timeoutSeconds,
            MIN_TOKEN_EXPIRATION_IN_SECONDS,
          ),
        })
      : undefined;

    const baseUrl = cleanServerUrl(this.twentyConfigService.get('SERVER_URL'));

    const flatApplicationVariables = isDefined(flatLogicFunction.applicationId)
      ? (applicationVariableMaps.byApplicationId[
          flatLogicFunction.applicationId
        ] ?? [])
      : [];

    const envVariables = {
      ...(isDefined(baseUrl)
        ? {
            [DEFAULT_API_URL_NAME]: baseUrl,
          }
        : {}),
      ...(isDefined(applicationAccessToken)
        ? {
            [DEFAULT_API_KEY_NAME]: applicationAccessToken.token,
          }
        : {}),
      ...buildEnvVar(flatApplicationVariables, this.secretEncryptionService),
    };

    const applicationUniversalIdentifier = isDefined(
      flatLogicFunction.applicationId,
    )
      ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
          ?.universalIdentifier
      : undefined;

    if (!isDefined(applicationUniversalIdentifier)) {
      throw new LogicFunctionExecutionException(
        `Application universal identifier not found for logic function ${flatLogicFunction.id}`,
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    if (
      !(await this.hasLayerDependencies({
        flatApplication,
        applicationUniversalIdentifier,
      }))
    ) {
      throw new LogicFunctionExecutionException(
        'Logic function dependencies not found',
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const resultLogicFunction = await this.callWithTimeout({
      callback: () =>
        this.execute({
          flatLogicFunction,
          flatApplication,
          applicationUniversalIdentifier,
          payload,
          env: envVariables,
        }),
      timeoutMs: flatLogicFunction.timeoutSeconds * 1000,
    });

    if (this.twentyConfigService.get('LOGIC_FUNCTION_LOGS_ENABLED')) {
      /* eslint-disable no-console */
      console.log(resultLogicFunction.logs);
    }

    await this.subscriptionService.publish({
      channel: SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
      workspaceId,
      payload: {
        logicFunctionLogs: {
          logs: resultLogicFunction.logs,
          id: flatLogicFunction.id,
          name: flatLogicFunction.name,
          universalIdentifier: flatLogicFunction.universalIdentifier,
          applicationId: flatLogicFunction.applicationId,
          applicationUniversalIdentifier,
        },
      },
    });

    this.auditService
      .createContext({
        workspaceId,
      })
      .insertWorkspaceEvent(LOGIC_FUNCTION_EXECUTED_EVENT, {
        duration: resultLogicFunction.duration,
        status: resultLogicFunction.status,
        ...(resultLogicFunction.error && {
          errorType: resultLogicFunction.error.errorType,
        }),
        functionId: flatLogicFunction.id,
        functionName: flatLogicFunction.name,
      });

    return resultLogicFunction;
  }

  async getAvailablePackages(logicFunctionId: string) {
    const logicFunction = await this.logicFunctionRepository.findOneOrFail({
      where: { id: logicFunctionId },
      relations: ['application'],
    });

    return logicFunction.application.availablePackages ?? {};
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

  private async hasLayerDependencies({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<boolean> {
    const packageJsonExists = await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'package.json',
    });
    const yarnLockExists = await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'yarn.lock',
    });

    return packageJsonExists && yarnLockExists;
  }
}
