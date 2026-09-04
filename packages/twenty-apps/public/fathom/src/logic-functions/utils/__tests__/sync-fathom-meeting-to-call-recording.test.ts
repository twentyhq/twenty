import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';

const mocks = vi.hoisted(() => ({
  enqueueFathomMediaDownloadRequest: vi.fn(),
  findMatchingCalendarEvent: vi.fn(),
  upsertCallRecording: vi.fn(),
  recordFathomMediaFailure: vi.fn(),
}));

vi.mock('src/logic-functions/utils/enqueue-fathom-media-download.util', () => ({
  enqueueFathomMediaDownloadRequest: mocks.enqueueFathomMediaDownloadRequest,
}));

vi.mock('src/logic-functions/utils/find-matching-calendar-event.util', () => ({
  findMatchingCalendarEvent: mocks.findMatchingCalendarEvent,
}));

vi.mock('src/logic-functions/utils/upsert-call-recording.util', () => ({
  upsertCallRecording: mocks.upsertCallRecording,
}));

vi.mock('src/logic-functions/utils/record-fathom-media-failure.util', () => ({
  recordFathomMediaFailure: mocks.recordFathomMediaFailure,
}));

const { syncFathomMeetingToCallRecording } = await import(
  'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util'
);

const coreApiClient = { query: vi.fn(), mutation: vi.fn() };
const meeting = buildFathomMeeting({ recordingId: 123 });

describe('syncFathomMeetingToCallRecording', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.findMatchingCalendarEvent.mockResolvedValue(undefined);
    mocks.upsertCallRecording.mockResolvedValue({ created: true });
    mocks.enqueueFathomMediaDownloadRequest.mockResolvedValue(undefined);
    mocks.recordFathomMediaFailure.mockResolvedValue(undefined);
  });

  it('requests the media download for the recording it just upserted', async () => {
    const result = await syncFathomMeetingToCallRecording({
      coreApiClient,
      meeting,
      connectedAccountId: 'connection-1',
    });

    expect(mocks.enqueueFathomMediaDownloadRequest).toHaveBeenCalledWith({
      connectedAccountId: 'connection-1',
      recordingId: 123,
      callRecordingId: result.callRecordingId,
    });
  });

  it('leaves media alone when the caller has no connected account to download with', async () => {
    await syncFathomMeetingToCallRecording({ coreApiClient, meeting });

    expect(mocks.enqueueFathomMediaDownloadRequest).not.toHaveBeenCalled();
  });

  it('keeps the transcript sync successful when the media job cannot be queued', async () => {
    mocks.enqueueFathomMediaDownloadRequest.mockRejectedValue(
      new Error('queue unavailable'),
    );

    await expect(
      syncFathomMeetingToCallRecording({
        coreApiClient,
        meeting,
        connectedAccountId: 'connection-1',
      }),
    ).resolves.toMatchObject({ created: true });
    expect(mocks.upsertCallRecording).toHaveBeenCalledOnce();
    expect(mocks.recordFathomMediaFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: FATHOM_MEDIA_FAILURE_REASON.ENQUEUE_FAILED,
      }),
    );
  });

  it('leaves a settled failure reason in place for an automatic sync', async () => {
    await syncFathomMeetingToCallRecording({
      coreApiClient,
      meeting,
      connectedAccountId: 'connection-1',
    });

    expect(mocks.upsertCallRecording).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.not.objectContaining({
          fathomMediaFailureReason: null,
        }),
      }),
    );
  });

  it('clears the failure reason when the caller asks to retry media', async () => {
    await syncFathomMeetingToCallRecording({
      coreApiClient,
      meeting,
      connectedAccountId: 'connection-1',
      retryMedia: true,
    });

    expect(mocks.upsertCallRecording).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.objectContaining({ fathomMediaFailureReason: null }),
      }),
    );
  });
});
