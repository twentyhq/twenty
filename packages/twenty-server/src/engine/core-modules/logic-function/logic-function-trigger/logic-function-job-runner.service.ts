import { Injectable, Logger } from '@nestjs/common';

import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LOGIC_FUNCTION_APPLICATION_RETRY_LIMIT } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-application-retry-limit.constant';
import { isRetryableLogicFunctionExecutionError } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/is-retryable-logic-function-execution-error.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export type LogicFunctionJobPayload = {
  logicFunctionId: string;
  workspaceId: string;
  payload?: object;
  userId?: string;
  userWorkspaceId?: string;
  applicationRetryCount?: number;
};

@Injectable()
export class LogicFunctionJobRunnerService {
  private readonly logger = new Logger(LogicFunctionJobRunnerService.name);

  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  async run({
    logicFunctionPayload,
    retryLimit,
    persistRetryCount,
  }: {
    logicFunctionPayload: LogicFunctionJobPayload;
    retryLimit: number;
    persistRetryCount: (applicationRetryCount: number) => Promise<void>;
  }): Promise<void> {
    try {
      const retryCount = logicFunctionPayload.applicationRetryCount ?? 0;
      const maxRetries = Math.min(
        LOGIC_FUNCTION_APPLICATION_RETRY_LIMIT,
        retryLimit,
      );
      const logicFunctionExecutionResult =
        await this.logicFunctionExecutorService.execute({
          logicFunctionId: logicFunctionPayload.logicFunctionId,
          workspaceId: logicFunctionPayload.workspaceId,
          payload: logicFunctionPayload.payload ?? {},
          userId: logicFunctionPayload.userId,
          userWorkspaceId: logicFunctionPayload.userWorkspaceId,
          retry: { retryCount, maxRetries },
        });

      if (
        !isRetryableLogicFunctionExecutionError(
          logicFunctionExecutionResult.error,
        ) ||
        retryCount >= maxRetries
      ) {
        return;
      }

      await persistRetryCount(retryCount + 1);

      throw new RetryableLogicFunctionError(
        logicFunctionExecutionResult.error.errorMessage,
      );
    } catch (error) {
      // A stopped application must not fail the job: failing would make
      // the queue retry an execution that is intentionally blocked.
      if (
        error instanceof LogicFunctionException &&
        error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED
      ) {
        return;
      }

      // Same reason as a stopped application: the usage engine refused this
      // execution on purpose, and a queue retry cannot change that.
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
}
