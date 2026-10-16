import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncTeamsTranscriptToCallRecordingOrThrow } from 'src/features/transcripts/logic-functions/utils/sync-teams-transcript-to-call-recording-or-throw';

const {
  fetchTeamsTranscriptDataMock,
  doesCallRecordingHaveSpeakerNamesMock,
  upsertCallRecordingMock,
} = vi.hoisted(() => ({
  fetchTeamsTranscriptDataMock: vi.fn(),
  doesCallRecordingHaveSpeakerNamesMock: vi.fn(),
  upsertCallRecordingMock: vi.fn(),
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/fetch-teams-transcript-data',
  () => ({ fetchTeamsTranscriptData: fetchTeamsTranscriptDataMock }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/find-teams-transcript-calendar-event-id-or-throw',
  () => ({
    findTeamsTranscriptCalendarEventIdOrThrow: vi
      .fn()
      .mockResolvedValue(undefined),
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/does-call-recording-have-speaker-names-or-throw',
  () => ({
    doesCallRecordingHaveSpeakerNamesOrThrow:
      doesCallRecordingHaveSpeakerNamesMock,
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/upsert-call-recording-or-throw',
  () => ({ upsertCallRecordingOrThrow: upsertCallRecordingMock }),
);

const ATTRIBUTED_CONTENT = [
  'WEBVTT',
  '',
  '00:00:01.000 --> 00:00:03.000',
  '<v Alice Martin>Hello everyone.</v>',
].join('\n');

const UNATTRIBUTED_CONTENT = [
  '00:00:01.000 --> 00:00:03.000',
  '',
  'Hello everyone.',
].join('\n');

const mockTranscriptContent = ({
  content,
  isSpeakerAttributed,
}: {
  content: string;
  isSpeakerAttributed: boolean;
}) =>
  fetchTeamsTranscriptDataMock.mockResolvedValue({
    meeting: { subject: 'Quarterly review' },
    transcript: {
      id: 'transcript-1',
      createdDateTime: '2026-10-16T09:00:00Z',
      endDateTime: '2026-10-16T09:30:00Z',
    },
    transcriptContent: { content, isSpeakerAttributed },
  });

const syncTranscript = () =>
  syncTeamsTranscriptToCallRecordingOrThrow({
    accessToken: 'token',
    coreApiClient: { query: vi.fn(), mutation: vi.fn() },
    meetingId: 'meeting-1',
    transcriptId: 'transcript-1',
  });

const getUpsertedFields = () => upsertCallRecordingMock.mock.calls[0][0].fields;

describe('syncTeamsTranscriptToCallRecordingOrThrow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    doesCallRecordingHaveSpeakerNamesMock.mockResolvedValue(true);
    upsertCallRecordingMock.mockResolvedValue({
      created: false,
      skipped: false,
    });
  });

  it('should replace a stored transcript with the speaker names Microsoft returns', async () => {
    mockTranscriptContent({
      content: ATTRIBUTED_CONTENT,
      isSpeakerAttributed: true,
    });

    await expect(syncTranscript()).resolves.toMatchObject({
      isSpeakerAttributed: true,
    });
    expect(getUpsertedFields().transcript).toEqual([
      {
        participant: { name: 'Alice Martin' },
        words: [{ text: 'Hello everyone.', start_timestamp: { relative: 1 } }],
      },
    ]);
  });

  it('should keep a stored transcript with speaker names when Microsoft withholds them', async () => {
    mockTranscriptContent({
      content: UNATTRIBUTED_CONTENT,
      isSpeakerAttributed: false,
    });
    await expect(syncTranscript()).resolves.toMatchObject({
      isSpeakerAttributed: false,
    });
    expect(getUpsertedFields()).not.toHaveProperty('transcript');
    expect(getUpsertedFields()).toMatchObject({
      title: 'Quarterly review',
      status: 'COMPLETED',
    });
  });

  it('should write a transcript without speaker names when none is stored with names', async () => {
    mockTranscriptContent({
      content: UNATTRIBUTED_CONTENT,
      isSpeakerAttributed: false,
    });
    doesCallRecordingHaveSpeakerNamesMock.mockResolvedValue(false);

    await syncTranscript();

    expect(getUpsertedFields().transcript).toEqual([
      {
        participant: { name: null },
        words: [{ text: 'Hello everyone.', start_timestamp: { relative: 1 } }],
      },
    ]);
  });
});
