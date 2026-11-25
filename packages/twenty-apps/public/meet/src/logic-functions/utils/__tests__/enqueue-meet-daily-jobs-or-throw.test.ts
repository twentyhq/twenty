import { enqueueJobs } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type MeetDailyJobName } from 'src/logic-functions/types/meet-daily-job-name.type';
import { buildMeetDailyJob } from 'src/logic-functions/utils/build-meet-daily-job.util';
import { enqueueMeetDailyJobsOrThrow } from 'src/logic-functions/utils/enqueue-meet-daily-jobs-or-throw.util';

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: vi.fn() }));

const NOW = new Date('2026-11-17T03:23:00Z');

const JOB_NAME: MeetDailyJobName = 'renewal';

const DAILY_JOBS = {
  logicFunctionUniversalIdentifier: 'logic-function-universal-identifier',
  jobName: JOB_NAME,
  now: NOW,
  delayMilliseconds: 90_000,
};

describe('enqueueMeetDailyJobsOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should queue one delayed job per connection', async () => {
    await enqueueMeetDailyJobsOrThrow({
      ...DAILY_JOBS,
      connectedAccountIds: ['first', 'second'],
    });

    expect(enqueueJobs).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier: 'logic-function-universal-identifier',
      jobs: ['first', 'second'].map((connectedAccountId) =>
        buildMeetDailyJob({
          jobName: 'renewal',
          connectedAccountId,
          now: NOW,
        }),
      ),
      delayMs: 90_000,
    });
  });

  it('should queue the jobs in batches of two hundred', async () => {
    await enqueueMeetDailyJobsOrThrow({
      ...DAILY_JOBS,
      connectedAccountIds: Array.from(
        { length: 201 },
        (_, index) => `connection-${index}`,
      ),
    });

    expect(
      vi.mocked(enqueueJobs).mock.calls.map(([{ jobs }]) => jobs?.length),
    ).toEqual([200, 1]);
  });

  it('should queue nothing when no account is connected', async () => {
    await enqueueMeetDailyJobsOrThrow({
      ...DAILY_JOBS,
      connectedAccountIds: [],
    });

    expect(enqueueJobs).not.toHaveBeenCalled();
  });
});
