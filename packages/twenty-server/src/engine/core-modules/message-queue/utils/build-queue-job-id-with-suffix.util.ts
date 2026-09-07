// Deduplicated jobs get their caller-provided id suffixed with a v4 so the queue
// never rejects them as already known, which is what lets a waiting job be
// queued while a job with the same prefix is running
export const buildQueueJobIdWithSuffix = ({
  jobIdPrefix,
  suffix,
}: {
  jobIdPrefix: string;
  suffix: string;
}): string => `${jobIdPrefix}-${suffix}`;
