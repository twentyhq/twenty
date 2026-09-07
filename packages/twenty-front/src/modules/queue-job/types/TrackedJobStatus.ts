import { type JobStatus } from '~/generated-metadata/graphql';

export type TrackedJobStatus = Pick<
  JobStatus,
  'jobId' | 'state' | 'failedReason'
>;
