import { describe, expect, it } from 'vitest';
import {
  type JobStatusResult,
  type JobStatusState,
} from 'twenty-sdk/logic-function';

import {
  getIsBackfillSettled,
  summarizeBackfillJobs,
} from 'src/utils/summarize-backfill-jobs';

const jobStatus = (
  jobId: string,
  state: JobStatusState,
): JobStatusResult => ({ jobId, state, attemptsMade: 0, enqueuedAt: 0 });

describe('summarizeBackfillJobs', () => {
  it('counts each reported state', () => {
    expect(
      summarizeBackfillJobs({
        jobIds: ['a', 'b', 'c', 'd'],
        jobStatuses: [
          jobStatus('a', 'COMPLETED'),
          jobStatus('b', 'FAILED'),
          jobStatus('c', 'ACTIVE'),
          jobStatus('d', 'WAITING'),
        ],
      }),
    ).toEqual({ total: 4, completed: 1, failed: 1, running: 1, pending: 1 });
  });

  it('treats delayed jobs as pending, since the run staggers them', () => {
    expect(
      summarizeBackfillJobs({
        jobIds: ['a'],
        jobStatuses: [jobStatus('a', 'DELAYED')],
      }).pending,
    ).toBe(1);
  });

  it('counts a job the queue has dropped as completed', () => {
    expect(
      summarizeBackfillJobs({ jobIds: ['a', 'b'], jobStatuses: [] }),
    ).toEqual({ total: 2, completed: 2, failed: 0, running: 0, pending: 0 });
  });

  it('is settled only once nothing is running or pending', () => {
    expect(
      getIsBackfillSettled(
        summarizeBackfillJobs({
          jobIds: ['a', 'b'],
          jobStatuses: [jobStatus('a', 'COMPLETED'), jobStatus('b', 'FAILED')],
        }),
      ),
    ).toBe(true);

    expect(
      getIsBackfillSettled(
        summarizeBackfillJobs({
          jobIds: ['a'],
          jobStatuses: [jobStatus('a', 'ACTIVE')],
        }),
      ),
    ).toBe(false);
  });
});
