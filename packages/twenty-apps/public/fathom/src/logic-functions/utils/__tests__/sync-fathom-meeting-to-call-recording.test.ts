import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncFathomMeetingToCallRecording } from 'src/logic-functions/utils/sync-fathom-meeting-to-call-recording.util';

const mocks = vi.hoisted(() => ({
  findMatchingCalendarEvent: vi.fn(),
  findCallRecordingMediaState: vi.fn(),
  upsertCallRecording: vi.fn(),
  upsertFathomRecordingImport: vi.fn(),
  completeFathomCallRecordingImport: vi.fn(),
  enqueueFathomCallRecordingTitleGeneration: vi.fn(),
  enqueueFathomMediaDownloadRequest: vi.fn(),
}));

vi.mock('src/logic-functions/utils/find-matching-calendar-event.util', () => ({
  findMatchingCalendarEvent: mocks.findMatchingCalendarEvent,
}));
vi.mock(
  'src/logic-functions/utils/find-call-recording-media-state.util',
  () => ({ findCallRecordingMediaState: mocks.findCallRecordingMediaState }),
);
vi.mock('src/logic-functions/utils/upsert-call-recording.util', () => ({
  upsertCallRecording: mocks.upsertCallRecording,
}));
vi.mock(
  'src/logic-functions/utils/upsert-fathom-recording-import.util',
  () => ({ upsertFathomRecordingImport: mocks.upsertFathomRecordingImport }),
);
vi.mock(
  'src/logic-functions/utils/complete-fathom-call-recording-import.util',
  () => ({
    completeFathomCallRecordingImport: mocks.completeFathomCallRecordingImport,
  }),
);
vi.mock(
  'src/logic-functions/utils/enqueue-fathom-call-recording-title-generation.util',
  () => ({
    enqueueFathomCallRecordingTitleGeneration:
      mocks.enqueueFathomCallRecordingTitleGeneration,
  }),
);
vi.mock(
  'src/logic-functions/utils/enqueue-fathom-media-download-request.util',
  () => ({
    enqueueFathomMediaDownloadRequest: mocks.enqueueFathomMediaDownloadRequest,
  }),
);

const meeting = {
  title: 'Customer call',
  meetingTitle: 'Customer call',
  recordingId: 123,
  recordingStartTime: new Date('2026-01-01T10:00:10.000Z'),
  recordingEndTime: new Date('2026-01-01T10:29:00.000Z'),
} as Meeting;

describe('syncFathomMeetingToCallRecording', () => {
  const mutation = vi.fn();
  const coreApiClient = { query: vi.fn(), mutation };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findCallRecordingMediaState.mockResolvedValue(undefined);
    mocks.upsertCallRecording.mockImplementation(
      async ({ callRecordingId }: { callRecordingId: string }) => ({
        callRecordingId,
        created: true,
      }),
    );
    mutation.mockResolvedValue({});
  });

  it('adds a Fathom participant to the matched calendar event', async () => {
    mocks.findMatchingCalendarEvent.mockResolvedValue('calendar-event-1');

    const { callRecordingId } = await syncFathomMeetingToCallRecording({
      coreApiClient,
      meeting,
      connectedAccountId: 'connected-account-1',
    });

    expect(mutation).toHaveBeenCalledExactlyOnceWith({
      createCalendarEventParticipants: {
        __args: {
          data: [
            {
              id: callRecordingId,
              calendarEventId: 'calendar-event-1',
              handle: 'Fathom',
              displayName: 'Fathom',
              isOrganizer: false,
              responseStatus: 'ACCEPTED',
            },
          ],
          upsert: true,
        },
        id: true,
      },
    });
  });

  it('adds no participant when no calendar event matches', async () => {
    mocks.findMatchingCalendarEvent.mockResolvedValue(undefined);

    await syncFathomMeetingToCallRecording({
      coreApiClient,
      meeting,
      connectedAccountId: 'connected-account-1',
    });

    expect(mutation).not.toHaveBeenCalled();
  });
});
