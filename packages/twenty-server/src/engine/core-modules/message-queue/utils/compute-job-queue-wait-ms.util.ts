import { type Job } from 'bullmq';

export const computeJobQueueWaitMs = ({
  job,
  now,
}: {
  job: Pick<Job, 'timestamp' | 'opts' | 'attemptsMade'>;
  now: number;
}): number | undefined => {
  // A retried job keeps its creation timestamp, so the time since creation
  // spans the previous attempts and their backoff: there is no base left to
  // measure the current wait from
  if (job.attemptsMade > 0) {
    return undefined;
  }

  // opts.delay is the wait the job was scheduled with: the delay requested at
  // enqueue time, or the interval to the next iteration for scheduler jobs.
  // BullMQ resets job.delay to 0 when it promotes the job, opts.delay stays.
  const expectedDelayMs = job.opts.delay ?? 0;

  return Math.max(0, now - job.timestamp - expectedDelayMs);
};
