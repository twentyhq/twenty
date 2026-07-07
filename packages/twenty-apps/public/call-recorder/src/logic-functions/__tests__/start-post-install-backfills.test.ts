import { beforeEach, describe, expect, it, vi } from 'vitest';

import postInstallLogicFunction, {
  startPostInstallBackfillsHandler,
} from 'src/logic-functions/start-post-install-backfills';

const requestCallRecordingSummariesBackfillMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/data/request-call-recording-summaries-backfill.util',
  () => ({
    requestCallRecordingSummariesBackfill:
      requestCallRecordingSummariesBackfillMock,
  }),
);

describe('start-post-install-backfills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestCallRecordingSummariesBackfillMock.mockResolvedValue(true);
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

  it('skips the summary backfill on fresh installs', async () => {
    const result = await startPostInstallBackfillsHandler({
      newVersion: '1.0.7',
    });

    expect(result).toEqual({
      summaryBackfillOutcome: 'skipped-initial-install',
    });
    expect(requestCallRecordingSummariesBackfillMock).not.toHaveBeenCalled();
  });

  it('requests the summary backfill on version upgrades', async () => {
    const result = await startPostInstallBackfillsHandler({
      previousVersion: '1.0.6',
      newVersion: '1.0.7',
    });

    expect(result).toEqual({
      summaryBackfillOutcome: 'backfill-requested',
    });
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
});
