import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cancelOpenScheduledCallRecordingRequests: vi.fn(),
  cancelWorkspaceRecallBotsOrThrow: vi.fn(),
  findOpenOrLiveCallRecordings: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {},
}));

vi.mock(
  'src/logic-functions/data/cancel-open-scheduled-call-recording-requests.util',
  () => ({
    cancelOpenScheduledCallRecordingRequests:
      mocks.cancelOpenScheduledCallRecordingRequests,
  }),
);

vi.mock(
  'src/logic-functions/data/find-open-or-live-call-recordings.util',
  () => ({
    findOpenOrLiveCallRecordings: mocks.findOpenOrLiveCallRecordings,
  }),
);

vi.mock('src/logic-functions/flows/cancel-workspace-recall-bots.util', () => ({
  cancelWorkspaceRecallBotsOrThrow: mocks.cancelWorkspaceRecallBotsOrThrow,
}));

import uninstallLogicFunction, {
  cancelRecallBotsOnUninstallHandler,
} from 'src/logic-functions/cancel-recall-bots-on-uninstall';

const UNINSTALL_EXECUTION_TIME = new Date('2026-01-01T08:00:00.000Z');
const RECORD_CLEANUP_REQUEST_START_CUTOFF = new Date(
  '2026-01-01T08:00:05.000Z',
);

describe('cancel-recall-bots-on-uninstall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(UNINSTALL_EXECUTION_TIME);
    mocks.findOpenOrLiveCallRecordings.mockResolvedValue([
      {
        id: 'call-recording-1',
        status: 'SCHEDULED',
        externalBotId: 'known-bot',
      },
      { id: 'call-recording-2', status: 'SCHEDULED' },
      {
        id: 'call-recording-3',
        status: 'SCHEDULED',
        externalBotId: 'known-bot',
      },
    ]);
    mocks.cancelOpenScheduledCallRecordingRequests.mockResolvedValue(3);
    mocks.cancelWorkspaceRecallBotsOrThrow.mockResolvedValue({
      scannedBotCount: 1,
      canceledExternalBotIds: ['known-bot'],
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('uses a request-compatible 30 second uninstall timeout', () => {
    expect(uninstallLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'cancel-recall-bots-on-uninstall',
        timeoutSeconds: 30,
      }),
    );
  });

  it('cancels open records by id then passes their bot ids to one scan of upcoming bots', async () => {
    const uninstallCleanupResult = await cancelRecallBotsOnUninstallHandler();

    expect(mocks.cancelOpenScheduledCallRecordingRequests).toHaveBeenCalledWith(
      expect.anything(),
      ['call-recording-1', 'call-recording-2', 'call-recording-3'],
      expect.any(Function),
    );
    expect(mocks.cancelWorkspaceRecallBotsOrThrow).toHaveBeenCalledWith({
      knownExternalBotIds: ['known-bot'],
      joinAtAfter: '2026-01-01T08:00:00.000Z',
      cancellationCutoffEpochMs: new Date('2026-01-01T08:00:15.000Z').getTime(),
    });
    expect(uninstallCleanupResult).toEqual({
      canceledCallRecordingRequestCount: 3,
      scannedBotCount: 1,
      canceledExternalBotIds: ['known-bot'],
    });
  });

  it('fails when upcoming Recall bots are left after the cleanup', async () => {
    mocks.cancelWorkspaceRecallBotsOrThrow.mockRejectedValue(
      new Error(
        'uninstall bot cleanup incomplete: upcoming Recall bots are left',
      ),
    );

    await expect(cancelRecallBotsOnUninstallHandler()).rejects.toThrow(
      'upcoming Recall bots are left',
    );
    expect(mocks.cancelOpenScheduledCallRecordingRequests).toHaveBeenCalled();
  });

  it('removes the bots of recordings in progress without cancelling their records', async () => {
    mocks.findOpenOrLiveCallRecordings.mockResolvedValue([
      {
        id: 'call-recording-1',
        status: 'SCHEDULED',
        externalBotId: 'known-bot',
      },
      {
        id: 'call-recording-4',
        status: 'RECORDING',
        externalBotId: 'live-bot',
      },
    ]);

    await cancelRecallBotsOnUninstallHandler();

    expect(mocks.cancelOpenScheduledCallRecordingRequests).toHaveBeenCalledWith(
      expect.anything(),
      ['call-recording-1'],
      expect.any(Function),
    );
    expect(mocks.cancelWorkspaceRecallBotsOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        knownExternalBotIds: ['known-bot', 'live-bot'],
      }),
    );
  });

  it('reserves the remaining cancellation window when record reads consume their budget', async () => {
    mocks.findOpenOrLiveCallRecordings.mockImplementationOnce(
      async ({
        shouldStartPageRequest,
      }: {
        shouldStartPageRequest: () => boolean;
      }) => {
        expect(shouldStartPageRequest()).toBe(true);
        vi.setSystemTime(RECORD_CLEANUP_REQUEST_START_CUTOFF);

        return [
          {
            id: 'call-recording-1',
            status: 'SCHEDULED',
            externalBotId: 'known-bot',
          },
        ];
      },
    );

    await expect(cancelRecallBotsOnUninstallHandler()).rejects.toThrow(
      'record cleanup request cutoff reached before updates started',
    );
    expect(
      mocks.cancelOpenScheduledCallRecordingRequests,
    ).not.toHaveBeenCalled();
    expect(mocks.cancelWorkspaceRecallBotsOrThrow).toHaveBeenCalledWith({
      knownExternalBotIds: ['known-bot'],
      joinAtAfter: '2026-01-01T08:00:00.000Z',
      cancellationCutoffEpochMs: new Date('2026-01-01T08:00:15.000Z').getTime(),
    });
  });

  it('still attempts Recall cleanup and then fails loudly when record updates fail', async () => {
    mocks.cancelOpenScheduledCallRecordingRequests.mockRejectedValue(
      new Error('Cannot update records'),
    );

    await expect(cancelRecallBotsOnUninstallHandler()).rejects.toThrow(
      'failed to cancel open call recording requests: Cannot update records',
    );
    expect(mocks.cancelWorkspaceRecallBotsOrThrow).toHaveBeenCalledWith({
      knownExternalBotIds: ['known-bot'],
      joinAtAfter: '2026-01-01T08:00:00.000Z',
      cancellationCutoffEpochMs: new Date('2026-01-01T08:00:15.000Z').getTime(),
    });
  });

  it('runs the Recall safety scan and fails loudly when open records cannot be read', async () => {
    mocks.findOpenOrLiveCallRecordings.mockRejectedValue(
      new Error('Cannot read records'),
    );

    await expect(cancelRecallBotsOnUninstallHandler()).rejects.toThrow(
      'failed to read open call recording requests: Cannot read records',
    );
    expect(
      mocks.cancelOpenScheduledCallRecordingRequests,
    ).not.toHaveBeenCalled();
    expect(mocks.cancelWorkspaceRecallBotsOrThrow).toHaveBeenCalledWith({
      knownExternalBotIds: [],
      joinAtAfter: '2026-01-01T08:00:00.000Z',
      cancellationCutoffEpochMs: new Date('2026-01-01T08:00:15.000Z').getTime(),
    });
  });
});
