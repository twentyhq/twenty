import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Not, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  type LogicFunctionExecuteResult,
  type LogicFunctionTranspileParams,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { ApplicationLogsService } from 'src/engine/core-modules/application-logs/application-logs.service';
import { parseApplicationLogLines } from 'src/engine/core-modules/application-logs/utils/parse-application-log-lines';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import type { FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { LOGIC_FUNCTION_EXECUTED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/logic-function/logic-function-executed';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { buildEnvVar } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-env-var';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { cleanServerUrl } from 'src/utils/clean-server-url';

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
  private readonly logger = new Logger(LogicFunctionExecutorService.name);

  constructor(
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly secretEncryptionService: SecretEncryptionService,
    private readonly subscriptionService: SubscriptionService,
    private readonly auditService: AuditService,
    private readonly applicationLogsService: ApplicationLogsService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
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
    });

    const driver = this.logicFunctionDriverFactory.getCurrentDriver();

    let resultLogicFunction: LogicFunctionExecuteResult;

    try {
      resultLogicFunction = await driver.execute({
        flatLogicFunction,
        flatApplication,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        payload,
        env: envVariables,
        timeoutMs: flatLogicFunction.timeoutSeconds * 1_000,
      });
    } catch (error) {
      this.logger.error(
        `Logic function execution failed: ` +
          `functionId=${logicFunctionId}, ` +
          `workspaceId=${workspaceId}, ` +
          `driver=${driver.constructor.name}: ` +
          `${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    await this.handleExecutionResult({
      result: resultLogicFunction,
      flatApplication,
      flatLogicFunction,
      workspaceId,
    });

    return resultLogicFunction;
  }

  async transpile(
    params: LogicFunctionTranspileParams,
  ): Promise<LogicFunctionTranspileResult> {
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();

    return driver.transpile(params);
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

    const flatApplicationVariableUniversalIdentifiers =
      applicationVariableMaps.universalIdentifiersByApplicationId[
        flatApplication.id
      ] ?? [];

    const flatApplicationVariables = flatApplicationVariableUniversalIdentifiers
      .map(
        (universalIdentifier) =>
          applicationVariableMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined);

    return { flatApplication, flatLogicFunction, flatApplicationVariables };
  }

  private async getExecutionEnvVariables({
    workspaceId,
    flatApplication,
    flatApplicationVariables,
  }: {
    workspaceId: string;
    flatApplication: FlatApplication;
    flatApplicationVariables: FlatApplicationVariable[];
  }) {
    const applicationAccessToken =
      await this.applicationTokenService.generateApplicationAccessToken({
        workspaceId,
        applicationId: flatApplication.id,
      });

    const baseUrl = cleanServerUrl(this.twentyConfigService.get('SERVER_URL'));

    const serverVariables = await this.buildServerVariableEnvMap(
      flatApplication.applicationRegistrationId,
    );
    const workspaceVariables = buildEnvVar(
      flatApplicationVariables,
      this.secretEncryptionService,
    );

    return {
      [DEFAULT_API_URL_NAME]: baseUrl ?? '',
      [DEFAULT_APP_ACCESS_TOKEN_NAME]: applicationAccessToken.token,
      [DEFAULT_API_KEY_NAME]: applicationAccessToken.token,
      APPLICATION_ID: flatApplication.id,
      // Server variables first, workspace variables override. Workspace-level
      // values let a specific tenant customize a server default.
      ...serverVariables,
      ...workspaceVariables,
    };
  }

  // Resolves encrypted server-level variables (ApplicationRegistrationVariable)
  // for the application's registration. Returns an empty object when the
  // application isn't linked to a registration (legacy LOCAL apps).
  //
  // Runs on every logic function execution — the query is indexed on
  // applicationRegistrationId and filters unfilled rows server-side. Most
  // apps have 0-3 server variables so the round-trip is cheap, but if this
  // becomes a hot path, move to a WorkspaceCacheProvider mirroring
  // WorkspaceApplicationVariableMapCacheService.
  private async buildServerVariableEnvMap(
    applicationRegistrationId: string | null,
  ): Promise<Record<string, string>> {
    if (!isDefined(applicationRegistrationId)) {
      return {};
    }

    const serverVariables =
      await this.applicationRegistrationVariableRepository.find({
        where: {
          applicationRegistrationId,
          encryptedValue: Not(''),
        },
      });

    const envMap: Record<string, string> = {};

    // ApplicationRegistrationVariable.encryptedValue is always written
    // encrypted (ApplicationRegistrationVariableService.createVariable and
    // .updateVariable call encrypt unconditionally), independent of
    // `isSecret`. `isSecret` is display metadata — the storage contract is
    // not conditional, so decryption isn't either.
    for (const variable of serverVariables) {
      envMap[variable.key] = this.secretEncryptionService.decrypt(
        variable.encryptedValue,
      );
    }

    return envMap;
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
    const executionId = v4();

    const parsedLines = parseApplicationLogLines(result.logs);
    const logEntries = parsedLines.map((line) => ({
      ...line,
      workspaceId,
      applicationId: flatApplication.id,
      logicFunctionId: flatLogicFunction.id,
      logicFunctionName: flatLogicFunction.name,
      executionId,
    }));

    this.applicationLogsService.writeLogs(logEntries);

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

    let periodStart: Date | undefined;

    if (this.billingService.isBillingEnabled()) {
      const {
        billingSubscription: { currentPeriodStart },
      } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'billingSubscription',
      ]);

      periodStart = currentPeriodStart;

      await this.billingUsageService.decrementAvailableCredits({
        workspaceId,
        usedCredits: 100,
      });
    }

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.LOGIC_FUNCTION,
          operationType: UsageOperationType.CODE_EXECUTION,
          creditsUsedMicro: 100,
          quantity: 1,
          unit: UsageUnit.INVOCATION,
          resourceId: flatLogicFunction.id,
          periodStart,
        },
      ],
      workspaceId,
    );
  }
}
