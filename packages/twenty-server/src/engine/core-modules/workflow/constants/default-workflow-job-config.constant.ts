import { type MessageQueueJobConfig } from 'src/engine/core-modules/message-queue/types/message-queue-job-config.type';

export const DEFAULT_WORKFLOW_JOB_CONFIG: MessageQueueJobConfig = {
  limiter: {
    max: 100,
    durationMs: 60_000,
  },
};
