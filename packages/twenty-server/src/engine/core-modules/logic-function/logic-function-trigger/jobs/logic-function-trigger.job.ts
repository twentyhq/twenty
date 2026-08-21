import { Logger, Scope } from '@nestjs/common';

import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import { LOGIC_FUNCTION_APPLICATION_RETRY_LIMIT } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-application-retry-limit.constant';
import { isRetryableLogicFunctionExecutionError } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/is-retryable-logic-function-execution-error.util';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobRetryContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export type LogicFunctionTriggerJobData = {
  logicFunctionId: string;
  workspaceId: string;
  payload?: object;
  userId?: string;
  userWorkspaceId?: string;
  applicationRetryCount?: number;
};

@Processor({
  queueName: MessageQueue.logicFunctionQueue,
  scope: Scope.REQUEST,
})
export class LogicFunctionTriggerJob {
  private readonly logger = new Logger(LogicFunctionTriggerJob.name);

  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {}

  @Process(LogicFunctionTriggerJob.name)
  async handle(
    jobData: LogicFunctionTriggerJobData | LogicFunctionTriggerJobData[],
    jobContext: MessageQueueJobRetryContext<
      LogicFunctionTriggerJobData | LogicFunctionTriggerJobData[]
    >,
  ) {
    // Jobs enqueued in version <=2.24.x carry arrays, remove this case once those jobs are drained
    const logicFunctionPayloads = Array.isArray(jobData) ? jobData : [jobData];

    for (const [
      payloadIndex,
      logicFunctionPayload,
    ] of logicFunctionPayloads.entries()) {
      try {
        const retryCount = logicFunctionPayload.applicationRetryCount ?? 0;
        const maxRetries = Math.min(
          LOGIC_FUNCTION_APPLICATION_RETRY_LIMIT,
          jobContext.retryLimit,
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
          isRetryableLogicFunctionExecutionError(
            logicFunctionExecutionResult.error,
          )
        ) {
          if (retryCount >= maxRetries) {
            continue;
          }

          const updatedLogicFunctionPayload = {
            ...logicFunctionPayload,
            applicationRetryCount: retryCount + 1,
          };

          await jobContext.updateData(
            Array.isArray(jobData)
              ? logicFunctionPayloads.map((payload, index) =>
                  index === payloadIndex
                    ? updatedLogicFunctionPayload
                    : payload,
                )
              : updatedLogicFunctionPayload,
          );

          throw new RetryableLogicFunctionError(
            logicFunctionExecutionResult.error.errorMessage,
          );
        }
      } catch (error) {
        // A stopped application must not fail the job: failing would make
        // the queue retry an execution that is intentionally blocked.
        if (
          error instanceof LogicFunctionException &&
          error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED
        ) {
          continue;
        }

        if (
          error instanceof LogicFunctionException &&
          error.code ===
            LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED
        ) {
          this.logger.warn(
            `Skipping function ${logicFunctionPayload.logicFunctionId} (workspace ${logicFunctionPayload.workspaceId}): ${error.message}`,
          );
          continue;
        }

        throw error;
      }
    }
  }
}
