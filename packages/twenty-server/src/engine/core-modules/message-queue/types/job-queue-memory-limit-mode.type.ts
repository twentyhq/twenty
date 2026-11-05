import { type JOB_QUEUE_MEMORY_LIMIT_MODE } from 'src/engine/core-modules/message-queue/constants/job-queue-memory-limit-mode.constant';

export type JobQueueMemoryLimitMode =
  (typeof JOB_QUEUE_MEMORY_LIMIT_MODE)[keyof typeof JOB_QUEUE_MEMORY_LIMIT_MODE];
