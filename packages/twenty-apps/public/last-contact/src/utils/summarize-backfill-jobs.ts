import {
  type JobStatusResult,
  type JobStatusState,
} from 'twenty-sdk/logic-function';

import { type BackfillProgress } from 'src/constants/backfill';

const PENDING_JOB_STATES: JobStatusState[] = [
  'WAITING',
  'DELAYED',
  'PRIORITIZED',
  'WAITING_CHILDREN',
];

// getJobs omits ids the queue no longer holds, and the queue drops a job once
// it has completed and aged out. A job the run enqueued but the queue cannot
// account for has therefore finished, and counting it as pending would stall
// the reported progress short of the total forever.
export const summarizeBackfillJobs = ({
  jobIds,
  jobStatuses,
}: {
  jobIds: string[];
  jobStatuses: JobStatusResult[];
}): BackfillProgress => {
  const countByState = (states: JobStatusState[]): number =>
    jobStatuses.filter((jobStatus) => states.includes(jobStatus.state)).length;

  const failed = countByState(['FAILED']);
  const running = countByState(['ACTIVE']);
  const pending = countByState(PENDING_JOB_STATES);

  return {
    total: jobIds.length,
    completed: jobIds.length - failed - running - pending,
    failed,
    running,
    pending,
  };
};

export const getIsBackfillSettled = ({
  running,
  pending,
}: BackfillProgress): boolean => running === 0 && pending === 0;
