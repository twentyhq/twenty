import { type QueueJobSettings } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const WARM_UP_LOGIC_FUNCTION_JOB_NAME = 'WarmUpLogicFunctionJob';

export const WARM_UP_LOGIC_FUNCTION_JOB_OPTIONS: QueueJobSettings = {
  retryLimit: 5,
  backoff: { strategy: 'exponential', initialDelayMilliseconds: 30_000 },
};

export type WarmUpLogicFunctionJobData = {
  workspaceId: string;
  applicationId: string;
  logicFunctionUniversalIdentifier: string;
};
