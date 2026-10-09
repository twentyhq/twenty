import { describe, expect, it } from 'vitest';

import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { buildFathomCallRecordingTitle } from 'src/logic-functions/utils/build-fathom-call-recording-title.util';
import { isFathomCallRecordingUpToDate } from 'src/logic-functions/utils/is-fathom-call-recording-up-to-date.util';

const MEETING = {
  title: 'Customer call',
  meetingTitle: 'Customer call',
  meetingUrl: 'https://meet.google.com/abc-defg-hij',
  recordingStartTime: '2026-08-20T10:00:00.000Z',
  recordingEndTime: '2026-08-20T10:30:00.000Z',
};

const COMPLETE_CALL_RECORDING: CallRecordingSyncState = {
  id: 'call-recording-id',
  updatedAt: '2026-08-20T11:00:00.000Z',
  fathomRecordingImportId: 'call-recording-id',
  fathomRecordingImportUpdatedAt: '2026-08-20T11:00:00.000Z',
  recordingId: '42',
  hasVideo: true,
  hasAudio: false,
  failureReason: undefined,
  connectedAccountId: 'connection-1',
  downloadId: undefined,
  uploadCheckpoint: undefined,
  isDeleted: false,
  status: 'COMPLETED',
  title: 'Customer call',
  recordingRequestStatus: 'REQUESTED',
  startedAt: '2026-08-20T10:00:00+00:00',
  endedAt: '2026-08-20T10:30:00.000Z',
  calendarEventId: 'calendar-event-id',
  hasTranscript: true,
  hasSummary: true,
};

describe('isFathomCallRecordingUpToDate', () => {
  it('treats a completed recording holding everything a sync would write as up to date', () => {
    expect(
      isFathomCallRecordingUpToDate({
        meeting: MEETING,
        callRecording: COMPLETE_CALL_RECORDING,
      }),
    ).toBe(true);
  });

  it('treats a recording whose media Fathom could not provide as up to date', () => {
    expect(
      isFathomCallRecordingUpToDate({
        meeting: MEETING,
        callRecording: {
          ...COMPLETE_CALL_RECORDING,
          hasVideo: false,
          failureReason: 'no_downloadable_media',
        },
      }),
    ).toBe(true);
  });

  it('does not require a calendar link for a meeting without a meeting URL', () => {
    expect(
      isFathomCallRecordingUpToDate({
        meeting: { ...MEETING, meetingUrl: null },
        callRecording: {
          ...COMPLETE_CALL_RECORDING,
          calendarEventId: undefined,
        },
      }),
    ).toBe(true);
  });

  describe('impromptu meetings', () => {
    const IMPROMPTU_MEETING = {
      ...MEETING,
      title: 'Impromptu Zoom Meeting',
      meetingTitle: 'Impromptu Zoom Meeting',
    };
    const PLACEHOLDER_TITLE = buildFathomCallRecordingTitle({
      ...IMPROMPTU_MEETING,
      recordingStartTime: new Date(IMPROMPTU_MEETING.recordingStartTime),
    }).title;

    it('syncs a completed recording still holding the placeholder title so its title job is queued', () => {
      expect(
        isFathomCallRecordingUpToDate({
          meeting: IMPROMPTU_MEETING,
          callRecording: {
            ...COMPLETE_CALL_RECORDING,
            title: PLACEHOLDER_TITLE,
          },
        }),
      ).toBe(false);
    });

    it('treats a completed recording with its generated title as up to date', () => {
      expect(
        isFathomCallRecordingUpToDate({
          meeting: IMPROMPTU_MEETING,
          callRecording: {
            ...COMPLETE_CALL_RECORDING,
            title: 'Impromptu Zoom Meeting (Pricing discussion)',
          },
        }),
      ).toBe(true);
    });
  });

  it.each<[string, Partial<CallRecordingSyncState>]>([
    ['deleted', { isDeleted: true }],
    ['still processing', { status: 'PROCESSING' }],
    ['failed', { status: 'FAILED' }],
    ['not requested', { recordingRequestStatus: undefined }],
    ['missing its import', { fathomRecordingImportId: undefined }],
    ['missing its transcript', { hasTranscript: false }],
    ['missing its summary', { hasSummary: false }],
    ['waiting for media', { hasVideo: false }],
    [
      'recorded at another start time',
      { startedAt: '2026-08-20T10:01:00.000Z' },
    ],
    ['recorded at another end time', { endedAt: undefined }],
    ['not linked to a calendar event yet', { calendarEventId: undefined }],
  ])('syncs a recording that is %s', (_, overrides) => {
    expect(
      isFathomCallRecordingUpToDate({
        meeting: MEETING,
        callRecording: { ...COMPLETE_CALL_RECORDING, ...overrides },
      }),
    ).toBe(false);
  });
});
