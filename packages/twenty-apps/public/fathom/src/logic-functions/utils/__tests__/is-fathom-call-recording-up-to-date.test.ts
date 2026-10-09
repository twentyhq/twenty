import { describe, expect, it } from 'vitest';

import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { isFathomCallRecordingUpToDate } from 'src/logic-functions/utils/is-fathom-call-recording-up-to-date.util';

type MeetingFixture = Parameters<
  typeof isFathomCallRecordingUpToDate
>[0]['meeting'];

const MEETING: MeetingFixture = {
  title: 'Customer call',
  meetingTitle: 'Customer call',
  recordingStartTime: '2026-08-20T10:00:00.000Z',
  recordingEndTime: '2026-08-20T10:30:00.000Z',
};
const IMPROMPTU_MEETING: MeetingFixture = {
  ...MEETING,
  title: 'Impromptu Zoom Meeting',
  meetingTitle: 'Impromptu Zoom Meeting',
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
  hasTranscript: true,
  hasSummary: true,
};

describe('isFathomCallRecordingUpToDate', () => {
  it.each<[string, MeetingFixture, Partial<CallRecordingSyncState>]>([
    ['holds everything a sync would write', MEETING, {}],
    [
      'has media Fathom could not provide',
      MEETING,
      { hasVideo: false, failureReason: 'no_downloadable_media' },
    ],
    [
      'has its generated impromptu title',
      IMPROMPTU_MEETING,
      { title: 'Impromptu Zoom Meeting (Pricing discussion)' },
    ],
  ])('skips a recording that %s', (_, meeting, overrides) => {
    expect(
      isFathomCallRecordingUpToDate({
        meeting,
        callRecording: { ...COMPLETE_CALL_RECORDING, ...overrides },
      }),
    ).toBe(true);
  });

  it.each<[string, MeetingFixture, Partial<CallRecordingSyncState>]>([
    ['deleted', MEETING, { isDeleted: true }],
    ['still processing', MEETING, { status: 'PROCESSING' }],
    ['failed', MEETING, { status: 'FAILED' }],
    ['not requested', MEETING, { recordingRequestStatus: undefined }],
    ['missing its import', MEETING, { fathomRecordingImportId: undefined }],
    ['missing its transcript', MEETING, { hasTranscript: false }],
    ['missing its summary', MEETING, { hasSummary: false }],
    ['waiting for media', MEETING, { hasVideo: false }],
    [
      'recorded at another start time',
      MEETING,
      { startedAt: '2026-08-20T10:01:00.000Z' },
    ],
    ['recorded at another end time', MEETING, { endedAt: undefined }],
    [
      'still holding the impromptu placeholder title',
      IMPROMPTU_MEETING,
      { title: 'Impromptu Zoom Meeting (20 Aug 2026, 10:00 UTC)' },
    ],
  ])('syncs a recording that is %s', (_, meeting, overrides) => {
    expect(
      isFathomCallRecordingUpToDate({
        meeting,
        callRecording: { ...COMPLETE_CALL_RECORDING, ...overrides },
      }),
    ).toBe(false);
  });
});
