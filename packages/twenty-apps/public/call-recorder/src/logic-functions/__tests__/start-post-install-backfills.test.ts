import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backfill-call-recording-summaries-logic-function-universal-identifier';
import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/sweep-upcoming-calendar-events-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import postInstallLogicFunction, {
  startPostInstallBackfillsHandler,
} from 'src/logic-functions/start-post-install-backfills';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

const enqueuedLogicFunctionUniversalIdentifiers = (): string[] =>
  enqueueJobsMock.mock.calls.map(
    ([input]) => input.logicFunctionUniversalIdentifier,
  );

describe('start-post-install-backfills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobsMock.mockResolvedValue({ enqueued: true, enqueuedJobsCount: 1 });
  });

  it('is configured to run on app version upgrades', () => {
    expect(postInstallLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'start-post-install-backfills',
        timeoutSeconds: 30,
        shouldRunOnVersionUpgrade: true,
      }),
    );
  });

  it('enqueues the sweep and skips summaries on a fresh install', async () => {
    const result = await startPostInstallBackfillsHandler({
      newVersion: '1.9.0',
    });

    expect(result).toEqual({
      calendarEventSweepOutcome: 'sweep-enqueued',
      summaryBackfillOutcome: 'skipped-initial-install',
    });
    expect(enqueueJobsMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
    expect(enqueuedLogicFunctionUniversalIdentifiers()).toEqual([
      SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    ]);
  });

  it('enqueues the summary backfill and skips the sweep on an upgrade', async () => {
    const result = await startPostInstallBackfillsHandler({
      previousVersion: '1.8.0',
      newVersion: '1.9.0',
    });

    expect(result).toEqual({
      calendarEventSweepOutcome: 'skipped-upgrade',
      summaryBackfillOutcome: 'backfill-enqueued',
    });
    expect(enqueuedLogicFunctionUniversalIdentifiers()).toEqual([
      BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    ]);
  });

  it('throws when the fresh-install sweep enqueue fails so the hook retries', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      startPostInstallBackfillsHandler({ newVersion: '1.9.0' }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Network failed'),
    });
    expect(enqueuedLogicFunctionUniversalIdentifiers()).not.toContain(
      BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    );
  });

  it('throws when the upgrade summary backfill enqueue fails so the hook retries', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      startPostInstallBackfillsHandler({
        previousVersion: '1.8.0',
        newVersion: '1.9.0',
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Network failed'),
    });
    expect(enqueuedLogicFunctionUniversalIdentifiers()).not.toContain(
      SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    );
  });
});
