import { Injectable, Logger } from '@nestjs/common';

import {
  type LogicFunctionJobFailure,
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
import { type LogicFunctionJobFailureHandlerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/types/logic-function-job-failure-handler-job.type';
import { buildLogicFunctionJobFailureHandlerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-logic-function-job-failure-handler-job.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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
  // Set on the run of a function's onJobFailure handler: the export to call instead of the main handler.
  jobFailureHandlerName?: string;
};

type EnqueueJobFailureHandler = (
  jobFailureHandlerJob: LogicFunctionJobFailureHandlerJob,
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
    jobId,
    retryLimit,
    attemptsMade,
    persistRetryCount,
    enqueueJobFailureHandler,
  }: {
    logicFunctionPayload: LogicFunctionJobPayload;
    jobId: string;
    retryLimit: number;
    attemptsMade: number;
    persistRetryCount: (applicationRetryCount: number) => Promise<void>;
    enqueueJobFailureHandler: EnqueueJobFailureHandler;
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
          handlerName: logicFunctionPayload.jobFailureHandlerName,
        });

      const { error: executionError } = logicFunctionExecutionResult;

      if (!isDefined(executionError)) {
        return;
      }

      if (!isLogicFunctionRetryScheduled({ error: executionError, retry })) {
        await this.enqueueJobFailureHandlerIfDeclared({
          logicFunctionPayload,
          queueJobId: jobId,
          attemptsMade: attemptsMade + 1,
          error: {
            type: executionError.errorType,
            message: executionError.errorMessage,
          },
          enqueueJobFailureHandler,
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

      throw error;
    }
  }

  // Never throws: a throw would make the queue retry the run that already failed.
  async enqueueJobFailureHandlerIfDeclared({
    logicFunctionPayload,
    queueJobId,
    attemptsMade,
    error,
    enqueueJobFailureHandler,
  }: {
    logicFunctionPayload: LogicFunctionJobPayload;
    queueJobId: string;
    attemptsMade: number;
    error: LogicFunctionJobFailure['error'];
    enqueueJobFailureHandler: EnqueueJobFailureHandler;
  }): Promise<void> {
    // A failing onJobFailure run is final, otherwise a broken handler would loop.
    if (isDefined(logicFunctionPayload.jobFailureHandlerName)) {
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

      if (
        !isDefined(failedFlatLogicFunction) ||
        !isDefined(failedFlatLogicFunction.jobFailureHandlerName)
      ) {
        return;
      }

      await enqueueJobFailureHandler(
        buildLogicFunctionJobFailureHandlerJob({
          failedLogicFunctionPayload: logicFunctionPayload,
          jobFailureHandlerName: failedFlatLogicFunction.jobFailureHandlerName,
          applicationUniversalIdentifier:
            failedFlatLogicFunction.applicationUniversalIdentifier,
          queueJobId,
          attemptsMade,
          error,
        }),
      );
    } catch (enqueueError) {
      this.logger.error(
        `Could not enqueue the onJobFailure handler of function ${logicFunctionId} (workspace ${workspaceId}): ${enqueueError instanceof Error ? enqueueError.message : String(enqueueError)}`,
      );
    }
  }
}
