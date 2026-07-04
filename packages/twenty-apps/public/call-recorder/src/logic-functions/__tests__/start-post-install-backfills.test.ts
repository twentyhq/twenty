import { beforeEach, describe, expect, it, vi } from 'vitest';

import postInstallLogicFunction, {
  startPostInstallBackfillsHandler,
} from 'src/logic-functions/start-post-install-backfills';

const requestCallRecordingSummariesBackfillMock = vi.hoisted(() => vi.fn());
const requestUpcomingCalendarEventsReconciliationMock = vi.hoisted(() =>
  vi.fn(),
);

vi.mock(
  'src/logic-functions/data/request-call-recording-summaries-backfill.util',
  () => ({
    requestCallRecordingSummariesBackfill:
      requestCallRecordingSummariesBackfillMock,
  }),
);

vi.mock(
  'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util',
  () => ({
    requestUpcomingCalendarEventsReconciliation:
      requestUpcomingCalendarEventsReconciliationMock,
  }),
);

describe('start-post-install-backfills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestCallRecordingSummariesBackfillMock.mockResolvedValue(true);
    requestUpcomingCalendarEventsReconciliationMock.mockResolvedValue(true);
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

  it('sweeps calendar events but skips the summary backfill on fresh installs', async () => {
    const result = await startPostInstallBackfillsHandler({
      newVersion: '1.0.7',
    });

    expect(result).toEqual({
      calendarEventSweepOutcome: 'sweep-requested',
      summaryBackfillOutcome: 'skipped-initial-install',
    });
    expect(
      requestUpcomingCalendarEventsReconciliationMock,
    ).toHaveBeenCalledTimes(1);
    expect(requestCallRecordingSummariesBackfillMock).not.toHaveBeenCalled();
  });

  it('requests both backfills on version upgrades', async () => {
    const result = await startPostInstallBackfillsHandler({
      previousVersion: '1.0.6',
      newVersion: '1.0.7',
    });

    expect(result).toEqual({
      calendarEventSweepOutcome: 'sweep-requested',
      summaryBackfillOutcome: 'backfill-requested',
    });
    expect(
      requestUpcomingCalendarEventsReconciliationMock,
    ).toHaveBeenCalledTimes(1);
    expect(requestCallRecordingSummariesBackfillMock).toHaveBeenCalledTimes(1);
  });

  it('throws when both upgrade kickoff requests fail', async () => {
    requestUpcomingCalendarEventsReconciliationMock.mockResolvedValue(false);
    requestCallRecordingSummariesBackfillMock.mockResolvedValue(false);

    await expect(
      startPostInstallBackfillsHandler({
        previousVersion: '1.0.6',
        newVersion: '1.0.7',
      }),
    ).rejects.toThrow(
      'Failed to start post-install backfills: upcoming calendar event sweep, call recording summary backfill',
    );
  });

  it('still requests the summary backfill before throwing when the sweep kickoff fails', async () => {
    requestUpcomingCalendarEventsReconciliationMock.mockResolvedValue(false);

    await expect(
      startPostInstallBackfillsHandler({
        previousVersion: '1.0.6',
        newVersion: '1.0.7',
      }),
    ).rejects.toThrow(
      'Failed to start post-install backfills: upcoming calendar event sweep',
    );
    expect(requestCallRecordingSummariesBackfillMock).toHaveBeenCalledTimes(1);
  });

  it('throws when the summary backfill kickoff fails', async () => {
    requestCallRecordingSummariesBackfillMock.mockResolvedValue(false);

    await expect(
      startPostInstallBackfillsHandler({
        previousVersion: '1.0.6',
        newVersion: '1.0.7',
      }),
    ).rejects.toThrow(
      'Failed to start post-install backfills: call recording summary backfill',
    );
  });

  it('throws when the fresh-install calendar sweep kickoff fails', async () => {
    requestUpcomingCalendarEventsReconciliationMock.mockResolvedValue(false);

    await expect(
      startPostInstallBackfillsHandler({
        newVersion: '1.0.7',
      }),
    ).rejects.toThrow(
      'Failed to start post-install backfills: upcoming calendar event sweep',
    );
    expect(requestCallRecordingSummariesBackfillMock).not.toHaveBeenCalled();
  });
});
