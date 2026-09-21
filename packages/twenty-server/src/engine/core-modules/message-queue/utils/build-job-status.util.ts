import { type JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';
import { type QueueJobDetails } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { bullMQToJobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

export const buildJobStatus = ({
  jobId,
  job,
}: {
  jobId: string;
  job: QueueJobDetails<MessageQueueJobData>;
}): JobStatusDTO => ({
  jobId,
  state: bullMQToJobStateEnum[job.state],
  attemptsMade: job.attemptsMade,
  failedReason: job.failedReason,
  enqueuedAt: job.timestamp,
  startedAt: job.processedOn,
  finishedAt: job.finishedOn,
});
