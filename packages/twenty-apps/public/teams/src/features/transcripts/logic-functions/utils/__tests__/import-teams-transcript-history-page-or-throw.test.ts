import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { computeCallRecordingIdForTeamsTranscript } from 'src/features/transcripts/logic-functions/utils/compute-call-recording-id-for-teams-transcript';
import { importTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/import-teams-transcript-history-page-or-throw';

const { downloadMeetingTranscriptContentMock } = vi.hoisted(() => ({
  downloadMeetingTranscriptContentMock: vi.fn(),
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/download-meeting-transcript-content',
  () => ({
    downloadMeetingTranscriptContent: downloadMeetingTranscriptContentMock,
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/find-teams-calendar-event-ids-or-throw',
  () => ({
    findTeamsCalendarEventIdsOrThrow: vi.fn().mockResolvedValue(new Map()),
  }),
);

const RUN_STARTED_AT = '2026-09-15T00:00:00.000Z';

const TRANSCRIPT_CONTENT = [
  'WEBVTT',
  '',
  '00:00:01.000 --> 00:00:03.000',
  '<v Alice Martin>Hello.</v>',
  '',
].join('\n');

const MEETING = { id: 'meeting-1', subject: 'Weekly sync' };

const buildTranscript = (transcriptId: string) => ({
  meeting: MEETING,
  transcript: {
    id: transcriptId,
    createdDateTime: '2026-09-01T10:00:00Z',
    endDateTime: '2026-09-01T10:30:00Z',
  },
});

type ExistingCallRecordingRow = {
  transcriptId: string;
  status: string;
  createdAt?: string;
  deletedAt?: string;
};

const buildCoreApiClient = ({
  existingCallRecordings = [],
  deletedBeforeWriteTranscriptIds = [],
}: {
  existingCallRecordings?: ExistingCallRecordingRow[];
  deletedBeforeWriteTranscriptIds?: string[];
}) => ({
  query: vi
    .fn()
    .mockResolvedValueOnce({
      callRecordings: {
        edges: existingCallRecordings.map(
          ({ transcriptId, status, createdAt, deletedAt }) => ({
            node: {
              id: computeCallRecordingIdForTeamsTranscript(transcriptId),
              status,
              createdAt: createdAt ?? '2026-08-01T00:00:00.000Z',
              deletedAt: deletedAt ?? null,
            },
          }),
        ),
      },
    })
    .mockResolvedValue({
      callRecordings: {
        edges: deletedBeforeWriteTranscriptIds.map((transcriptId) => ({
          node: { id: computeCallRecordingIdForTeamsTranscript(transcriptId) },
        })),
      },
    }),
  mutation: vi.fn().mockResolvedValue({}),
});

const getWrittenCallRecordingIds = (
  coreApiClient: ReturnType<typeof buildCoreApiClient>,
): string[] =>
  coreApiClient.mutation.mock.calls.flatMap(
    ([request]) =>
      request.createCallRecordings.__args.data.map(
        ({ id }: { id: string }) => id,
      ) as string[],
  );

describe('importTeamsTranscriptHistoryPageOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    downloadMeetingTranscriptContentMock.mockResolvedValue(TRANSCRIPT_CONTENT);
  });

  it('should write new transcripts and leave completed and deleted recordings untouched', async () => {
    const coreApiClient = buildCoreApiClient({
      existingCallRecordings: [
        { transcriptId: 'completed', status: 'COMPLETED' },
        {
          transcriptId: 'deleted',
          status: 'COMPLETED',
          deletedAt: '2026-09-02T00:00:00.000Z',
        },
        { transcriptId: 'processing', status: 'PROCESSING' },
      ],
    });

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: ['completed', 'deleted', 'processing', 'new'].map(
          buildTranscript,
        ),
        importedSince: RUN_STARTED_AT,
      }),
    ).resolves.toEqual({
      transcriptCount: 0,
      alreadyImportedCount: 0,
      deletedCount: 0,
      importedCount: 2,
      skippedCount: 2,
      unavailableCount: 0,
    });
    expect(getWrittenCallRecordingIds(coreApiClient)).toEqual([
      computeCallRecordingIdForTeamsTranscript('processing'),
      computeCallRecordingIdForTeamsTranscript('new'),
    ]);
  });

  it('should count recordings a failed attempt of the page already wrote as imported', async () => {
    const coreApiClient = buildCoreApiClient({
      existingCallRecordings: [
        {
          transcriptId: 'written-by-failed-attempt',
          status: 'COMPLETED',
          createdAt: '2026-09-15T00:01:00.000Z',
        },
      ],
    });

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: ['written-by-failed-attempt', 'new'].map(buildTranscript),
        importedSince: RUN_STARTED_AT,
      }),
    ).resolves.toEqual({
      transcriptCount: 0,
      alreadyImportedCount: 0,
      deletedCount: 0,
      importedCount: 2,
      skippedCount: 0,
      unavailableCount: 0,
    });
    expect(getWrittenCallRecordingIds(coreApiClient)).toEqual([
      computeCallRecordingIdForTeamsTranscript('new'),
    ]);
  });

  it('should count transcripts with no content or gone from Microsoft as unavailable', async () => {
    downloadMeetingTranscriptContentMock
      .mockResolvedValueOnce('WEBVTT\n')
      .mockRejectedValueOnce(
        new GraphRequestError({
          message: 'Microsoft Graph request failed (404)',
          status: 404,
          innerErrorCode: undefined,
        }),
      );
    const coreApiClient = buildCoreApiClient({});

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: ['empty', 'gone', 'new'].map(buildTranscript),
        importedSince: RUN_STARTED_AT,
      }),
    ).resolves.toEqual({
      transcriptCount: 0,
      alreadyImportedCount: 0,
      deletedCount: 0,
      importedCount: 1,
      skippedCount: 0,
      unavailableCount: 2,
    });
    expect(getWrittenCallRecordingIds(coreApiClient)).toEqual([
      computeCallRecordingIdForTeamsTranscript('new'),
    ]);
  });

  it('should write a transcript listed twice only once', async () => {
    const coreApiClient = buildCoreApiClient({});

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: ['new', 'new'].map(buildTranscript),
        importedSince: RUN_STARTED_AT,
      }),
    ).resolves.toEqual({
      transcriptCount: 0,
      alreadyImportedCount: 0,
      deletedCount: 0,
      importedCount: 1,
      skippedCount: 0,
      unavailableCount: 0,
    });
    expect(getWrittenCallRecordingIds(coreApiClient)).toEqual([
      computeCallRecordingIdForTeamsTranscript('new'),
    ]);
  });

  it('should not bring back a recording deleted while the page downloaded it', async () => {
    const coreApiClient = buildCoreApiClient({
      deletedBeforeWriteTranscriptIds: ['deleted-during-import'],
    });

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: ['deleted-during-import', 'new'].map(buildTranscript),
        importedSince: RUN_STARTED_AT,
      }),
    ).resolves.toEqual({
      transcriptCount: 0,
      alreadyImportedCount: 0,
      deletedCount: 0,
      importedCount: 1,
      skippedCount: 1,
      unavailableCount: 0,
    });
    expect(getWrittenCallRecordingIds(coreApiClient)).toEqual([
      computeCallRecordingIdForTeamsTranscript('new'),
    ]);
  });
});
