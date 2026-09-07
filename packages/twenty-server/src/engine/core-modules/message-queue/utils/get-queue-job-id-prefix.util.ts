// bulkAdd appends the batch index after the v4 when the id comes from the
// batch options, so both shapes have to resolve to the same prefix
const GENERATED_JOB_ID_SUFFIX_PATTERN =
  /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-\d+)?$/i;

export const getQueueJobIdPrefix = (jobId: string): string =>
  jobId.replace(GENERATED_JOB_ID_SUFFIX_PATTERN, '');
