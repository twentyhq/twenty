import { type QueueJobDetails } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

export interface MessageQueueWorkerOptions {
  concurrency?: number;
  lockDuration?: number;
  maxStalledCount?: number;
  boundedShutdownDrain?: boolean;
  onJobStatusChange?: (
    job: QueueJobDetails<MessageQueueJobData>,
  ) => Promise<void>;
}
