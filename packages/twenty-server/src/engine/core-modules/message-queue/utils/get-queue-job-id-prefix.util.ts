const GENERATED_JOB_ID_SUFFIX_PATTERN =
  /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-\d+)?$/i;

export const getQueueJobIdPrefix = (jobId: string): string =>
  jobId.replace(GENERATED_JOB_ID_SUFFIX_PATTERN, '');
