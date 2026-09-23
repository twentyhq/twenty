import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const UPGRADE_WORKSPACE_APPLICATION_JOB_NAME =
  'UpgradeWorkspaceApplicationJob';

export const UPGRADE_WORKSPACE_APPLICATION_JOB_ENQUEUE_BATCH_SIZE = 500;

export const UPGRADE_WORKSPACE_APPLICATION_JOB_OPTIONS: QueueJobOptions = {
  retryLimit: 2,
  backoff: {
    strategy: 'exponential',
    initialDelayMilliseconds: 5_000,
    jitter: 0.5,
  },
};

export type UpgradeWorkspaceApplicationJobData = {
  applicationRegistrationId: string;
  workspaceId: string;
  onlyAutoUpgrade: boolean;
};
