import { isDefined } from 'twenty-shared/utils';

import { type InFlightQueueJob } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';

export const findInFlightQueueJobIdByPrefix = <
  TData extends MessageQueueJobData,
>({
  inFlightJobs,
  jobIdPrefix,
}: {
  inFlightJobs: InFlightQueueJob<TData>[];
  jobIdPrefix: string;
}): string | undefined =>
  inFlightJobs
    .map((job) => job.id)
    .filter(isDefined)
    .find((jobId) => getQueueJobIdPrefix(jobId) === jobIdPrefix);
