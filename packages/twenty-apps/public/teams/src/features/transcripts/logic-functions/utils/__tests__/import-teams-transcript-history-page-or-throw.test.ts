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

const buildTranscript = (transcriptId: string) => ({
  meeting: { id: 'meeting-1', subject: 'Weekly sync' },
  transcript: {
    id: transcriptId,
    createdDateTime: '2026-09-01T10:00:00Z',
    endDateTime: '2026-09-01T10:30:00Z',
  },
});

type CallRecordingRow = {
  id: string;
  status: string;
  createdAt: string;
  deletedAt: string | null;
};

type CallRecordingsFilter = {
  id: { in: string[] };
  deletedAt?: { is: 'NULL' | 'NOT_NULL' };
  or?: { deletedAt?: { is: 'NULL' | 'NOT_NULL' } }[];
};

// Like Twenty, soft-deleted rows only match a filter that asks for deletedAt.
const isVisibleThroughFilter = (
  { deletedAt }: CallRecordingRow,
  filter: CallRecordingsFilter,
): boolean => {
  const deletedAtConditions = (filter.or ?? [filter]).map(
    (condition) => condition.deletedAt?.is,
  );

  if (deletedAtConditions.every((condition) => condition === undefined)) {
    return deletedAt === null;
  }

  return deletedAtConditions.includes(deletedAt === null ? 'NULL' : 'NOT_NULL');
};

const buildCoreApiClient = (rows: CallRecordingRow[]) => {
  const rowsById = new Map(rows.map((row) => [row.id, row]));

  return {
    rowsById,
    query: vi.fn(
      async (request: {
        callRecordings: { __args: { filter: CallRecordingsFilter } };
      }) => {
        const { filter } = request.callRecordings.__args;

        return {
          callRecordings: {
            edges: filter.id.in
              .map((id) => rowsById.get(id))
              .filter(
                (row): row is CallRecordingRow =>
                  row !== undefined && isVisibleThroughFilter(row, filter),
              )
              .map((node) => ({ node })),
          },
        };
      },
    ),
    mutation: vi.fn(
      async (request: {
        createCallRecordings: {
          __args: { data: { id: string; status: string }[] };
        };
      }) => {
        for (const { id, status } of request.createCallRecordings.__args.data) {
          rowsById.set(id, {
            id,
            status,
            createdAt: '2026-09-15T00:02:00.000Z',
            deletedAt: null,
          });
        }

        return {};
      },
    ),
  };
};

const getWrittenTranscriptIds = (
  coreApiClient: ReturnType<typeof buildCoreApiClient>,
  transcriptIds: string[],
): string[] => {
  const writtenCallRecordingIds = coreApiClient.mutation.mock.calls.flatMap(
    ([request]) => request.createCallRecordings.__args.data.map(({ id }) => id),
  );

  return transcriptIds.filter((transcriptId) =>
    writtenCallRecordingIds.includes(
      computeCallRecordingIdForTeamsTranscript(transcriptId),
    ),
  );
};

const buildRow = (
  transcriptId: string,
  status: string,
  {
    createdAt = '2026-08-01T00:00:00.000Z',
    deletedAt = null,
  }: { createdAt?: string; deletedAt?: string | null } = {},
): CallRecordingRow => ({
  id: computeCallRecordingIdForTeamsTranscript(transcriptId),
  status,
  createdAt,
  deletedAt,
});

const toPageCounts = (
  counts: Partial<
    Record<'importedCount' | 'skippedCount' | 'unavailableCount', number>
  >,
) => ({
  transcriptCount: 0,
  alreadyImportedCount: 0,
  deletedCount: 0,
  importedCount: 0,
  skippedCount: 0,
  unavailableCount: 0,
  ...counts,
});

describe('importTeamsTranscriptHistoryPageOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    downloadMeetingTranscriptContentMock.mockResolvedValue(TRANSCRIPT_CONTENT);
  });

  it('should write new and unfinished transcripts and leave completed and deleted recordings alone', async () => {
    const transcriptIds = ['completed', 'deleted', 'processing', 'new'];
    const coreApiClient = buildCoreApiClient([
      buildRow('completed', 'COMPLETED'),
      buildRow('deleted', 'COMPLETED', {
        deletedAt: '2026-09-02T00:00:00.000Z',
      }),
      buildRow('processing', 'PROCESSING'),
    ]);

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: transcriptIds.map(buildTranscript),
        importedSince: RUN_STARTED_AT,
        isRunActive: async () => true,
      }),
    ).resolves.toEqual(toPageCounts({ importedCount: 2, skippedCount: 2 }));
    expect(getWrittenTranscriptIds(coreApiClient, transcriptIds)).toEqual([
      'processing',
      'new',
    ]);
    expect(downloadMeetingTranscriptContentMock).toHaveBeenCalledTimes(2);
  });

  it('should not bring back a recording deleted while the page downloaded it', async () => {
    const transcriptIds = ['deleted-during-import', 'new'];
    const coreApiClient = buildCoreApiClient([
      buildRow('deleted-during-import', 'PROCESSING'),
    ]);

    downloadMeetingTranscriptContentMock.mockImplementation(async () => {
      coreApiClient.rowsById.set(
        computeCallRecordingIdForTeamsTranscript('deleted-during-import'),
        buildRow('deleted-during-import', 'PROCESSING', {
          deletedAt: '2026-09-15T00:01:00.000Z',
        }),
      );

      return TRANSCRIPT_CONTENT;
    });

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: transcriptIds.map(buildTranscript),
        importedSince: RUN_STARTED_AT,
        isRunActive: async () => true,
      }),
    ).resolves.toEqual(toPageCounts({ importedCount: 1, skippedCount: 1 }));
    expect(getWrittenTranscriptIds(coreApiClient, transcriptIds)).toEqual([
      'new',
    ]);
  });

  it('should count recordings a failed attempt of the page already wrote as imported', async () => {
    const transcriptIds = ['written-by-failed-attempt', 'new'];
    const coreApiClient = buildCoreApiClient([
      buildRow('written-by-failed-attempt', 'COMPLETED', {
        createdAt: RUN_STARTED_AT,
      }),
    ]);

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: transcriptIds.map(buildTranscript),
        importedSince: RUN_STARTED_AT,
        isRunActive: async () => true,
      }),
    ).resolves.toEqual(toPageCounts({ importedCount: 2 }));
    expect(getWrittenTranscriptIds(coreApiClient, transcriptIds)).toEqual([
      'new',
    ]);
  });

  it('should skip transcripts with no content or gone from Microsoft', async () => {
    const transcriptIds = ['empty', 'gone', 'new'];
    const coreApiClient = buildCoreApiClient([]);

    downloadMeetingTranscriptContentMock
      .mockResolvedValueOnce('WEBVTT\n')
      .mockRejectedValueOnce(
        new GraphRequestError({
          message: 'Microsoft Graph request failed (404)',
          status: 404,
          innerErrorCode: undefined,
        }),
      );

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: transcriptIds.map(buildTranscript),
        importedSince: RUN_STARTED_AT,
        isRunActive: async () => true,
      }),
    ).resolves.toEqual(toPageCounts({ importedCount: 1, unavailableCount: 2 }));
    expect(getWrittenTranscriptIds(coreApiClient, transcriptIds)).toEqual([
      'new',
    ]);
  });

  it('should fail the page when Microsoft Graph fails for another reason', async () => {
    downloadMeetingTranscriptContentMock.mockRejectedValue(
      new GraphRequestError({
        message: 'Microsoft Graph request failed (503)',
        status: 503,
        innerErrorCode: undefined,
      }),
    );

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient: buildCoreApiClient([]),
        transcripts: [buildTranscript('new')],
        importedSince: RUN_STARTED_AT,
        isRunActive: async () => true,
      }),
    ).rejects.toThrow('503');
  });

  it('should write every transcript of a long page once, in batches', async () => {
    const transcriptIds = [
      ...Array.from({ length: 11 }, (_, index) => `new-${index}`),
      'new-0',
    ];
    const coreApiClient = buildCoreApiClient([]);

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: transcriptIds.map(buildTranscript),
        importedSince: RUN_STARTED_AT,
        isRunActive: async () => true,
      }),
    ).resolves.toEqual(toPageCounts({ importedCount: 11 }));
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(2);
    expect(coreApiClient.rowsById.size).toBe(11);
  });

  it('should stop writing once the run is removed', async () => {
    const coreApiClient = buildCoreApiClient([]);
    const isRunActive = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    await expect(
      importTeamsTranscriptHistoryPageOrThrow({
        accessToken: 'token',
        coreApiClient,
        transcripts: Array.from({ length: 11 }, (_, index) =>
          buildTranscript(`new-${index}`),
        ),
        importedSince: RUN_STARTED_AT,
        isRunActive,
      }),
    ).resolves.toEqual(toPageCounts({ importedCount: 10 }));
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(1);
  });
});
