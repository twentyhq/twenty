import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const WARM_UP_APPLICATION_LOGIC_FUNCTIONS_JOB_NAME =
  'WarmUpApplicationLogicFunctionsJob';

export const WARM_UP_APPLICATION_LOGIC_FUNCTIONS_JOB_OPTIONS: QueueJobOptions =
  {
    retryLimit: 3,
    backoff: { strategy: 'exponential', initialDelayMilliseconds: 10_000 },
  };

export type WarmUpApplicationLogicFunctionsJobData = {
  workspaceId: string;
  applicationId: string;
};
