import { type Job } from 'bullmq';

export const computeJobQueueWaitMs = ({
  job,
  now,
}: {
  job: Pick<Job, 'timestamp' | 'opts' | 'attemptsStarted'>;
  now: number;
}): number | undefined => {
  if (job.attemptsStarted > 1) {
    return undefined;
  }

  const expectedDelayMs = job.opts.delay ?? 0;

  return Math.max(0, now - job.timestamp - expectedDelayMs);
};
