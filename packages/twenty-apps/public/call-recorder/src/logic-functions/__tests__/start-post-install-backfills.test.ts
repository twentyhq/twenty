import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backfill-call-recording-summaries-logic-function-universal-identifier';
import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/sweep-upcoming-calendar-events-logic-function-universal-identifier';
import postInstallLogicFunction, {
  startPostInstallBackfillsHandler,
} from 'src/logic-functions/start-post-install-backfills';

const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJob: enqueueJobMock,
}));

const enqueuedLogicFunctionIdentifiers = (): string[] =>
  enqueueJobMock.mock.calls.map(
    ([input]) => input.logicFunctionUniversalIdentifier,
  );

describe('start-post-install-backfills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJobMock.mockImplementation(
      async ({ logicFunctionUniversalIdentifier }) => ({
        enqueued: true,
        logicFunctionUniversalIdentifier,
      }),
    );
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
      newVersion: '1.0.7',
    });

    expect(result).toEqual({
      calendarEventSweepOutcome: 'sweep-enqueued',
      summaryBackfillOutcome: 'skipped-initial-install',
    });
    expect(enqueuedLogicFunctionIdentifiers()).toEqual([
      SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    ]);
  });

  it('enqueues the summary backfill and skips the sweep on an upgrade', async () => {
    const result = await startPostInstallBackfillsHandler({
      previousVersion: '1.0.6',
      newVersion: '1.0.7',
    });

    expect(result).toEqual({
      calendarEventSweepOutcome: 'skipped-upgrade',
      summaryBackfillOutcome: 'backfill-enqueued',
    });
    expect(enqueuedLogicFunctionIdentifiers()).toEqual([
      BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    ]);
  });

  it('throws when the fresh-install sweep enqueue fails', async () => {
    enqueueJobMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      startPostInstallBackfillsHandler({ newVersion: '1.0.7' }),
    ).rejects.toThrow(
      'Failed to start post-install backfills: upcoming calendar event sweep',
    );
    expect(enqueuedLogicFunctionIdentifiers()).not.toContain(
      BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    );
  });

  it('throws when the upgrade summary backfill enqueue fails', async () => {
    enqueueJobMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      startPostInstallBackfillsHandler({
        previousVersion: '1.0.6',
        newVersion: '1.0.7',
      }),
    ).rejects.toThrow(
      'Failed to start post-install backfills: call recording summary backfill',
    );
    expect(enqueuedLogicFunctionIdentifiers()).not.toContain(
      SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    );
  });
});
