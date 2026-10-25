import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const DELETE_APPLICATION_RUNTIME_RESOURCES_JOB_NAME =
  'DeleteApplicationRuntimeResourcesJob';

export const DELETE_APPLICATION_RUNTIME_RESOURCES_JOB_OPTIONS: QueueJobOptions =
  {
    retryLimit: 3,
    backoff: { strategy: 'exponential', initialDelayMilliseconds: 30_000 },
  };

export type DeleteApplicationRuntimeResourcesJobData = {
  workspaceId: string;
  applicationUniversalIdentifiers: string[];
  logicFunctionIds: string[];
};
