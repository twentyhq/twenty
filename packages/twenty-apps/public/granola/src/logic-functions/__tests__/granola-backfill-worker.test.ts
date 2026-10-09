import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GRANOLA_WEBHOOK_REGISTRATION_KEY } from 'src/constants/granola.constant';
import { GRANOLA_UNAVAILABLE_RETRY_LIMIT } from 'src/constants/granola-history.constant';
import {
  GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
  GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { granolaBackfillWorkerHandler } from 'src/logic-functions/granola-backfill-worker';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { GranolaUnavailableError } from 'src/logic-functions/types/granola-unavailable-error';
import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';

const mocks = vi.hoisted(() => ({
  store: new Map<string, unknown>(),
  enqueueJobs: vi.fn<(input: EnqueueJobsInput) => Promise<unknown>>(),
  listNotes: vi.fn(),
  query: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  kv: {
    get: async (key: string) => mocks.store.get(key),
    set: async (key: string, value: unknown) => {
      mocks.store.set(key, value);
    },
    delete: async (key: string) => {
      mocks.store.delete(key);
    },
  },
  enqueueJobs: mocks.enqueueJobs,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
  },
}));

vi.mock(
  'src/logic-functions/utils/create-granola-client-or-throw.util',
  () => ({
    createGranolaClientOrThrow: () => ({ listNotes: mocks.listNotes }),
  }),
);

const API_KEY = 'grn_test_key';

const listNoteJobIds = async ({
  createdAfter,
  updatedAfter,
  folderId,
  runHour = '2026-09-06T10',
  updatedAt = '2026-09-05T11:00:00Z',
}: {
  createdAfter?: string;
  updatedAfter?: string;
  folderId?: string;
  runHour?: string;
  updatedAt?: string;
}): Promise<(string | undefined)[]> => {
  mocks.enqueueJobs.mockClear();
  mocks.listNotes.mockResolvedValue({
    notes: [
      buildGranolaNote({ id: 'not_aaaaaaaaaaaaaa', updated_at: updatedAt }),
      buildGranolaNote({ id: 'not_bbbbbbbbbbbbbb', updated_at: updatedAt }),
    ],
    hasMore: false,
    cursor: null,
  });

  await granolaBackfillWorkerHandler({
    registrationId: 'reg-1',
    createdAfter,
    updatedAfter,
    folderId,
    pageIndex: 0,
    runHour,
  });

  return mocks.enqueueJobs.mock.calls.map(([input]) => input.jobs?.[0]?.jobId);
};

const buildRegistration = (folderIds: string[]) => ({
  registrationId: 'reg-1',
  webhookEndpointId: 'wh-1',
  signingSecret: 'secret',
  apiKeyFingerprint: getGranolaApiKeyFingerprint(API_KEY),
  scopes: ['personal'],
  folderIds,
  isInitialBackfillEnqueued: true,
});

describe('granolaBackfillWorkerHandler', () => {
  beforeEach(() => {
    mocks.store.clear();
    vi.clearAllMocks();
    process.env[GRANOLA_API_KEY_ENV_VAR_NAME] = API_KEY;
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.query.mockResolvedValue({ callRecordings: { edges: [] } });
    mocks.store.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, buildRegistration([]));
  });

  it('only schedules notes that are new or changed since their last import, with one lookup per page', async () => {
    const notes = [
      buildGranolaNote({
        id: 'not_aaaaaaaaaaaaaa',
        updated_at: '2026-09-05T11:00:00Z',
      }),
      buildGranolaNote({
        id: 'not_bbbbbbbbbbbbbb',
        updated_at: '2026-09-06T09:00:00Z',
      }),
      buildGranolaNote({
        id: 'not_cccccccccccccc',
        updated_at: '2026-09-05T11:00:00Z',
      }),
      buildGranolaNote({
        id: 'not_dddddddddddddd',
        updated_at: '2026-09-05T11:00:00Z',
      }),
      buildGranolaNote({
        id: 'not_eeeeeeeeeeeeee',
        updated_at: '2026-09-05T11:00:00Z',
      }),
    ];
    const callRecordingIds = notes.map((note) =>
      computeCallRecordingIdForGranolaNote(note.id),
    );

    mocks.listNotes.mockResolvedValue({ notes, hasMore: false, cursor: null });
    mocks.query.mockResolvedValue({
      callRecordings: {
        edges: [
          {
            node: {
              id: callRecordingIds[0],
              deletedAt: null,
              granolaNoteUpdatedAt: '2026-09-05T11:00:00Z',
            },
          },
          {
            node: {
              id: callRecordingIds[1],
              deletedAt: null,
              granolaNoteUpdatedAt: '2026-09-05T11:00:00Z',
            },
          },
          {
            node: {
              id: callRecordingIds[2],
              deletedAt: '2026-09-05T12:00:00Z',
              granolaNoteUpdatedAt: null,
            },
          },
          {
            node: {
              id: callRecordingIds[3],
              deletedAt: null,
              granolaNoteUpdatedAt: null,
            },
          },
        ],
      },
    });

    const result = await granolaBackfillWorkerHandler({
      registrationId: 'reg-1',
      pageIndex: 0,
      runHour: '2026-09-06T10',
    });

    expect(mocks.query).toHaveBeenCalledExactlyOnceWith({
      callRecordings: {
        __args: {
          filter: {
            id: { in: callRecordingIds },
            or: [
              { deletedAt: { is: 'NULL' } },
              { deletedAt: { is: 'NOT_NULL' } },
            ],
          },
          first: 5,
        },
        edges: {
          node: { id: true, deletedAt: true, granolaNoteUpdatedAt: true },
        },
      },
    });
    expect(result).toEqual(
      expect.objectContaining({ discoveredNoteCount: 5, enqueuedNoteCount: 3 }),
    );
    expect(
      mocks.enqueueJobs.mock.calls
        .filter(
          ([input]) =>
            input.logicFunctionUniversalIdentifier ===
            GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
        )
        .map(([input]) => input.jobs?.[0]?.payload),
    ).toEqual([
      expect.objectContaining({
        noteId: 'not_bbbbbbbbbbbbbb',
        updatedAt: '2026-09-06T09:00:00Z',
      }),
      expect.objectContaining({ noteId: 'not_dddddddddddddd' }),
      expect.objectContaining({ noteId: 'not_eeeeeeeeeeeeee' }),
    ]);
  });

  it('gives an unchanged note the same import job across runs started in the same hour', async () => {
    const manualImport = await listNoteJobIds({
      createdAfter: '2026-08-07T10:00:00.123Z',
    });
    const catchUp = await listNoteJobIds({
      updatedAfter: '2026-09-04T04:00:00.456Z',
    });

    expect(manualImport).toHaveLength(2);
    expect(new Set(manualImport).size).toBe(2);
    expect(catchUp).toEqual(manualImport);
  });

  it('gives a note a new import job in a later hour', async () => {
    const thisHour = await listNoteJobIds({});
    const nextHour = await listNoteJobIds({ runHour: '2026-09-06T11' });

    expect(nextHour[0]).not.toBe(thisHour[0]);
  });

  it('gives a note a separate import job per folder', async () => {
    const first = await listNoteJobIds({ folderId: 'fol_aaaaaaaaaaaaaa' });
    const second = await listNoteJobIds({ folderId: 'fol_bbbbbbbbbbbbbb' });

    expect(second[0]).not.toBe(first[0]);
  });

  it('gives a note a new import job once the folder selection changes', async () => {
    const folderId = 'fol_aaaaaaaaaaaaaa';

    mocks.store.set(
      GRANOLA_WEBHOOK_REGISTRATION_KEY,
      buildRegistration([folderId]),
    );
    const before = await listNoteJobIds({ folderId });

    mocks.store.set(
      GRANOLA_WEBHOOK_REGISTRATION_KEY,
      buildRegistration([folderId, 'fol_bbbbbbbbbbbbbb']),
    );
    const after = await listNoteJobIds({ folderId });

    expect(after[0]).not.toBe(before[0]);
  });

  it('gives an edited note a new import job', async () => {
    const before = await listNoteJobIds({});
    const after = await listNoteJobIds({ updatedAt: '2026-09-06T09:00:00Z' });

    expect(after[0]).not.toBe(before[0]);
    expect(after[1]).not.toBe(before[1]);
  });

  describe('when Granola is rate limited', () => {
    const workerPayload = {
      registrationId: 'reg-1',
      folderId: 'fol_aaaaaaaaaaaaaa',
      cursor: 'cursor-3',
      pageIndex: 3,
      runHour: '2026-09-06T10',
    };

    beforeEach(() => {
      mocks.listNotes.mockRejectedValue(
        new GranolaUnavailableError({
          status: 429,
          retryAfterMilliseconds: 90_000,
        }),
      );
    });

    it('keeps the discovery chain alive by retrying the same page after Retry-After', async () => {
      const result = await granolaBackfillWorkerHandler(workerPayload);

      expect(result).toEqual({ success: true, deferred: true });
      expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          logicFunctionUniversalIdentifier:
            GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
          delayMs: 90_000,
          jobs: [
            expect.objectContaining({
              payload: { ...workerPayload, retryAttempt: 1 },
            }),
          ],
        }),
      );
    });

    it('gives every retry its own job so the queue does not drop it', async () => {
      await granolaBackfillWorkerHandler(workerPayload);
      await granolaBackfillWorkerHandler({ ...workerPayload, retryAttempt: 1 });

      const [firstRetryJobId, secondRetryJobId] =
        mocks.enqueueJobs.mock.calls.map(([input]) => input.jobs?.[0]?.jobId);

      expect(firstRetryJobId).toBeDefined();
      expect(secondRetryJobId).not.toBe(firstRetryJobId);
    });

    it('hands the failure back to the queue once the retry limit is reached', async () => {
      await expect(
        granolaBackfillWorkerHandler({
          ...workerPayload,
          retryAttempt: GRANOLA_UNAVAILABLE_RETRY_LIMIT,
        }),
      ).rejects.toBeInstanceOf(GranolaUnavailableError);
      expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    });

    it('gives the next page a fresh retry budget once the retried page succeeds', async () => {
      mocks.listNotes.mockResolvedValue({
        notes: [],
        hasMore: true,
        cursor: 'cursor-4',
      });

      await granolaBackfillWorkerHandler({
        ...workerPayload,
        retryAttempt: GRANOLA_UNAVAILABLE_RETRY_LIMIT,
      });

      expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          logicFunctionUniversalIdentifier:
            GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
          jobs: [
            expect.objectContaining({
              payload: {
                ...workerPayload,
                cursor: 'cursor-4',
                pageIndex: 4,
              },
            }),
          ],
        }),
      );
    });
  });
});
