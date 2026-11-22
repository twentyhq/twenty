import { Injectable, Logger } from '@nestjs/common';

import {
  type LogicFunctionFailureHandlerPayload,
  RetryableLogicFunctionError,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { isLogicFunctionRetryScheduled } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/is-logic-function-retry-scheduled.util';
import { LOGIC_FUNCTION_APPLICATION_RETRY_LIMIT } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-application-retry-limit.constant';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type LogicFunctionJobPayload = {
  logicFunctionId: string;
  workspaceId: string;
  applicationUniversalIdentifier?: string;
  payload?: object;
  userId?: string;
  userWorkspaceId?: string;
  applicationRetryCount?: number;
  isFailureHandlerRun?: boolean;
};

export type LogicFunctionFailureHandlerJob = {
  jobData: LogicFunctionJobPayload;
  applicationUniversalIdentifier: string;
};

type EnqueueFailureHandler = (
  failureHandlerJob: LogicFunctionFailureHandlerJob,
) => Promise<unknown>;

@Injectable()
export class LogicFunctionJobRunnerService {
  private readonly logger = new Logger(LogicFunctionJobRunnerService.name);

  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    @InjectWorkspaceScopedRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async run({
    logicFunctionPayload,
    retryLimit,
    attemptsMade,
    persistRetryCount,
    enqueueFailureHandler,
  }: {
    logicFunctionPayload: LogicFunctionJobPayload;
    retryLimit: number;
    attemptsMade: number;
    persistRetryCount: (applicationRetryCount: number) => Promise<void>;
    enqueueFailureHandler: EnqueueFailureHandler;
  }): Promise<void> {
    try {
      const retryCount = logicFunctionPayload.applicationRetryCount ?? 0;
      // Platform failures also spend queue attempts, so cap app retries by what the queue has left.
      const retry = {
        retryCount,
        maxRetries: Math.min(
          LOGIC_FUNCTION_APPLICATION_RETRY_LIMIT,
          retryCount + retryLimit - attemptsMade,
        ),
      };
      const logicFunctionExecutionResult =
        await this.logicFunctionExecutorService.execute({
          logicFunctionId: logicFunctionPayload.logicFunctionId,
          workspaceId: logicFunctionPayload.workspaceId,
          payload: logicFunctionPayload.payload ?? {},
          userId: logicFunctionPayload.userId,
          userWorkspaceId: logicFunctionPayload.userWorkspaceId,
          retry,
        });

      const { error: executionError } = logicFunctionExecutionResult;

      if (!isDefined(executionError)) {
        return;
      }

      if (!isLogicFunctionRetryScheduled({ error: executionError, retry })) {
        await this.enqueueFailureHandlerIfDeclared({
          logicFunctionPayload,
          failure: {
            errorType: executionError.errorType,
            errorMessage: executionError.errorMessage,
          },
          enqueueFailureHandler,
        });

        return;
      }

      await persistRetryCount(retryCount + 1);

      throw new RetryableLogicFunctionError(executionError.errorMessage);
    } catch (error) {
      // Failing would make the queue retry a run that is intentionally blocked.
      if (
        error instanceof LogicFunctionException &&
        (error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED ||
          error.code ===
            LogicFunctionExceptionCode.LOGIC_FUNCTION_WORKSPACE_SUSPENDED)
      ) {
        return;
      }

      // Delayed or retried jobs can outlive their application: once it is
      // uninstalled the job has nothing left to run, so retrying is pointless.
      // The metadata cache can lag right after an install, so only the
      // database tells an uninstall apart from a stale cache miss.
      if (
        error instanceof LogicFunctionExecutionException &&
        error.code ===
          LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND &&
        !(await this.logicFunctionRepository.existsBy(
          logicFunctionPayload.workspaceId,
          { id: logicFunctionPayload.logicFunctionId },
        ))
      ) {
        this.logger.log(
          `Skipping function ${logicFunctionPayload.logicFunctionId} (workspace ${logicFunctionPayload.workspaceId}): ${error.message}`,
        );

        return;
      }

      if (isUsageRefusedError(error)) {
        this.logger.warn(
          `Skipping function ${logicFunctionPayload.logicFunctionId} (workspace ${logicFunctionPayload.workspaceId}): ${error.message}`,
        );

        return;
      }

      if (
        error instanceof LogicFunctionException &&
        error.code ===
          LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED
      ) {
        this.logger.warn(
          `Skipping function ${logicFunctionPayload.logicFunctionId} (workspace ${logicFunctionPayload.workspaceId}): ${error.message}`,
        );

        return;
      }

      if (attemptsMade >= retryLimit) {
        await this.enqueueFailureHandlerIfDeclared({
          logicFunctionPayload,
          failure: {
            errorType: error instanceof Error ? error.name : 'Error',
            errorMessage:
              error instanceof Error ? error.message : String(error),
          },
          enqueueFailureHandler,
        });
      }

      throw error;
    }
  }

  private async enqueueFailureHandlerIfDeclared({
    logicFunctionPayload,
    failure,
    enqueueFailureHandler,
  }: {
    logicFunctionPayload: LogicFunctionJobPayload;
    failure: LogicFunctionFailureHandlerPayload['error'];
    enqueueFailureHandler: EnqueueFailureHandler;
  }): Promise<void> {
    if (logicFunctionPayload.isFailureHandlerRun) {
      return;
    }

    const { logicFunctionId, workspaceId } = logicFunctionPayload;

    try {
      const { flatLogicFunctionMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatLogicFunctionMaps',
        ]);

      const failedFlatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: logicFunctionId,
        flatEntityMaps: flatLogicFunctionMaps,
      });

      const failureHandlerUniversalIdentifier =
        failedFlatLogicFunction?.onFailureLogicFunctionUniversalIdentifier;

      if (
        !isDefined(failedFlatLogicFunction) ||
        !isDefined(failureHandlerUniversalIdentifier)
      ) {
        return;
      }

      const failureHandler = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatLogicFunctionMaps,
        universalIdentifier: failureHandlerUniversalIdentifier,
      });

      if (
        !isDefined(failureHandler) ||
        isDefined(failureHandler.deletedAt) ||
        failureHandler.applicationId !== failedFlatLogicFunction.applicationId
      ) {
        this.logger.warn(
          `Skipping failure handler ${failureHandlerUniversalIdentifier} of function ${logicFunctionId} (workspace ${workspaceId}): not a logic function of the same application`,
        );

        return;
      }

      const failureHandlerPayload: LogicFunctionFailureHandlerPayload = {
        failedLogicFunctionUniversalIdentifier:
          failedFlatLogicFunction.universalIdentifier,
        payload: logicFunctionPayload.payload ?? {},
        error: failure,
      };

      await enqueueFailureHandler({
        jobData: {
          logicFunctionId: failureHandler.id,
          workspaceId,
          payload: failureHandlerPayload,
          userId: logicFunctionPayload.userId,
          userWorkspaceId: logicFunctionPayload.userWorkspaceId,
          isFailureHandlerRun: true,
        },
        applicationUniversalIdentifier:
          failedFlatLogicFunction.applicationUniversalIdentifier,
      });
    } catch (error) {
      this.logger.error(
        `Could not enqueue the failure handler of function ${logicFunctionId} (workspace ${workspaceId}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
