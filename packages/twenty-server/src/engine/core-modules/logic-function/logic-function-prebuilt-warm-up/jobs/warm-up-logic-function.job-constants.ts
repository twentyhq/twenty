import { type LogicFunctionManagementBudgetPriority } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const WARM_UP_LOGIC_FUNCTION_JOB_NAME = 'WarmUpLogicFunctionJob';

export const WARM_UP_LOGIC_FUNCTION_JOB_OPTIONS: QueueJobOptions = {
  retryLimit: 1,
  backoff: { strategy: 'exponential', initialDelayMilliseconds: 1_000 },
};

export type WarmUpLogicFunctionJobData = {
  workspaceId: string;
  applicationId: string;
  logicFunctionUniversalIdentifier: string;
  managementBudgetPriority: LogicFunctionManagementBudgetPriority;
};
