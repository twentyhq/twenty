// bulkAdd appends the batch index after the v4 when the id comes from the
// batch options, so both shapes have to resolve to the same prefix
const GENERATED_JOB_ID_SUFFIX_PATTERN =
  /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-\d+)?$/i;

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

export const getQueueJobIdPrefix = (jobId: string): string =>
  jobId.replace(GENERATED_JOB_ID_SUFFIX_PATTERN, '');

export const isQueueJobIdAlreadyWaiting = ({
  waitingJobIds,
  jobIdOrPrefix,
}: {
  waitingJobIds: string[];
  jobIdOrPrefix: string;
}): boolean =>
  waitingJobIds.some(
    (waitingJobId) =>
      waitingJobId === jobIdOrPrefix ||
      getQueueJobIdPrefix(waitingJobId) === jobIdOrPrefix,
  );
