import { LOGIC_FUNCTION_FAILURE_HANDLER_RETRY_LIMIT } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-failure-handler-retry-limit.constant';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { type LogicFunctionFailureHandlerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/types/logic-function-failure-handler-job.type';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildLogicFunctionFailureHandlerJobOptions = ({
  jobData,
  applicationUniversalIdentifier,
}: LogicFunctionFailureHandlerJob): QueueJobOptions => ({
  retryLimit: LOGIC_FUNCTION_FAILURE_HANDLER_RETRY_LIMIT,
  backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
  workspaceId: jobData.workspaceId,
  applicationUniversalIdentifier,
});
