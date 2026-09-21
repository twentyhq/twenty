import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import postInstallLogicFunction, {
  startPostInstallBackfillsHandler,
} from 'src/logic-functions/start-post-install-backfills';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

describe('start-post-install-backfills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobsMock.mockResolvedValue({ enqueued: true, enqueuedJobsCount: 1 });
  });

  it('is configured to run on fresh installs only', () => {
    expect(postInstallLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'start-post-install-backfills',
        timeoutSeconds: 30,
      }),
    );
    expect(postInstallLogicFunction.config).not.toHaveProperty(
      'shouldRunOnVersionUpgrade',
    );
  });

  it('enqueues the upcoming calendar events sweep', async () => {
    const result = await startPostInstallBackfillsHandler();

    expect(result).toEqual({ calendarEventSweepOutcome: 'sweep-enqueued' });
    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
  });

  it('throws when the sweep enqueue fails so the hook retries', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('Network failed'));

    await expect(startPostInstallBackfillsHandler()).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Network failed'),
    });
  });
});
