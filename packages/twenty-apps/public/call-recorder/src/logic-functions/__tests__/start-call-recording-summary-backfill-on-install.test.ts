import { beforeEach, describe, expect, it, vi } from 'vitest';

import postInstallLogicFunction, {
  startCallRecordingSummaryBackfillOnInstallHandler,
} from 'src/logic-functions/start-call-recording-summary-backfill-on-install';

const requestCallRecordingSummariesBackfillMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/data/request-call-recording-summaries-backfill.util',
  () => ({
    requestCallRecordingSummariesBackfill:
      requestCallRecordingSummariesBackfillMock,
  }),
);

describe('start-call-recording-summary-backfill-on-install', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestCallRecordingSummariesBackfillMock.mockResolvedValue(true);
  });

  it('is configured to run on app version upgrades', () => {
    expect(postInstallLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'start-call-recording-summary-backfill-on-install',
        timeoutSeconds: 30,
        shouldRunOnVersionUpgrade: true,
      }),
    );
  });

  it('skips fresh installs', async () => {
    const result = await startCallRecordingSummaryBackfillOnInstallHandler({
      newVersion: '1.0.6',
    });

    expect(result).toEqual({ outcome: 'skipped-initial-install' });
    expect(requestCallRecordingSummariesBackfillMock).not.toHaveBeenCalled();
  });

  it('requests backfill on version upgrades', async () => {
    const result = await startCallRecordingSummaryBackfillOnInstallHandler({
      previousVersion: '1.0.5',
      newVersion: '1.0.6',
    });

    expect(result).toEqual({ outcome: 'backfill-requested' });
    expect(requestCallRecordingSummariesBackfillMock).toHaveBeenCalledTimes(1);
  });

  it('reports failed backfill kickoff requests', async () => {
    requestCallRecordingSummariesBackfillMock.mockResolvedValue(false);

    const result = await startCallRecordingSummaryBackfillOnInstallHandler({
      previousVersion: '1.0.5',
      newVersion: '1.0.6',
    });

    expect(result).toEqual({ outcome: 'backfill-request-failed' });
  });
});
